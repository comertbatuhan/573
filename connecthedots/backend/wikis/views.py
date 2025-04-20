from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from .models import Wiki

@api_view(['GET'])
def search_wikidata(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response([])

    escaped_query = query.replace('"', '\\"')

    sparql_query = f"""
    SELECT ?item ?itemLabel ?itemDescription WHERE {{
      ?item rdfs:label ?itemLabel .
      OPTIONAL {{ ?item schema:description ?itemDescription . }}
      FILTER(LANG(?itemLabel) = "en")
      FILTER(CONTAINS(LCASE(?itemLabel), LCASE("{escaped_query}")))
    }}
    LIMIT 10
    """

    headers = {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'ConnectTheDots/1.0'
    }

    try:
        response = requests.get("https://query.wikidata.org/sparql", params={'query': sparql_query}, headers=headers)
        response.raise_for_status()
        data = response.json()

        results = []
        for result in data['results']['bindings']:
            qid = result['item']['value'].split('/')[-1]
            results.append({
                'qID': qid,
                'label': result['itemLabel']['value'],
                'description': result.get('itemDescription', {}).get('value', '')
            })

        return Response(results)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

