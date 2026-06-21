from django.http import JsonResponse


def api_root(request):
    """Landing page when visiting the server root in a browser or API client."""
    data = {
        'name': 'AI Emergency Response Coordination System',
        'status': 'running',
        'message': 'This is an API-only backend. Use the endpoints below with a REST client (Postman, curl, etc.).',
        'auth': {
            'login': '/api/auth/login/',
            'register': '/api/auth/register/',
            'refresh': '/api/auth/refresh/',
            'me': '/api/auth/me/',
        },
        'endpoints': {
            'emergencies': '/api/emergencies/',
            'responders': '/api/responders/',
            'hospitals': '/api/hospitals/',
            'ai': '/api/ai/',
            'notifications': '/api/notifications/',
            'admin': '/admin/',
        },
        'docs': 'See README.md in the project root for setup, seeded credentials, and example requests.',
    }

    if request.headers.get('Accept', '').startswith('text/html'):
        endpoints = ''.join(
            f'<li><a href="{path}">{path}</a></li>'
            for path in data['endpoints'].values()
        )
        auth_links = ''.join(
            f'<li><code>{path}</code> — POST to login/register/refresh; GET for /me/</li>'
            for path in data['auth'].values()
        )
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{data['name']}</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }}
    h1 {{ font-size: 1.5rem; }}
    code {{ background: #f4f4f4; padding: 0.1em 0.35em; border-radius: 3px; }}
    .ok {{ color: #0a0; font-weight: 600; }}
  </style>
</head>
<body>
  <h1>{data['name']}</h1>
  <p class="ok">Server is running.</p>
  <p>{data['message']}</p>
  <h2>Authentication</h2>
  <ul>{auth_links}</ul>
  <h2>API routes</h2>
  <ul>{endpoints}</ul>
  <p><small>{data['docs']}</small></p>
</body>
</html>"""
        from django.http import HttpResponse
        return HttpResponse(html)

    return JsonResponse(data)
