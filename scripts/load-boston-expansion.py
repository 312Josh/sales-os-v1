import json, re, requests
from pathlib import Path

env={}
for line in Path('.env.local').read_text().splitlines():
    if line and not line.startswith('#') and '=' in line:
        k,v=line.split('=',1); env[k]=v

BASE=env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1/prospects'
HEADERS={
    'apikey': env['SUPABASE_SERVICE_ROLE_KEY'],
    'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY'],
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation'
}

def slug(s):
    return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')

def mk(business, niche, city, website, phone, priority=4):
    id_ = 'boston-' + slug(business)
    hook = f'Boston-metro {niche.lower()} practice where web intake and response speed still matter for high-intent leads.'
    return {
        'id': id_,
        'business_name': business,
        'market': 'Professional Services',
        'niche': niche,
        'city': city,
        'suburb': city,
        'website': website,
        'phone': phone,
        'contact_form_url': '',
        'decision_maker': '',
        'linkedin_url': '',
        'weak_site_signal': f'{niche} practice with likely manual lead handling and form-heavy intake.',
        'weak_intake_signal': 'Professional-services intake is often form-heavy and slower than it should be.',
        'no_chat_signal': True,
        'no_booking_signal': True,
        'owner_operated_signal': 'vertical:professional_services | market:boston',
        'audit_summary': f'Boston expansion prospect — {niche} in {city}.',
        'outreach_hook': hook,
        'site_score': 3,
        'intake_score': 3,
        'owner_fit_score': 4,
        'fit_score': 4,
        'priority_score': priority,
        'priority_reason': hook,
        'pipeline_stage': 'call_queued',
        'assigned_rep': 'Paul',
        'notes': f'Boston expansion load. vertical:professional_services | market:boston',
    }

records = [
    # Law firms
    mk('Pierce & Mandell, P.C.', 'Law', 'Boston', 'https://www.piercemandell.com/', '(617) 720-2444', 4),
    mk('Rose Law Partners LLP', 'Law', 'Boston', 'https://www.rose-law.net/', '(617) 712-0230', 4),
    mk('Fitch Law Partners LLP', 'Law', 'Boston', 'https://www.fitchlp.com/', '(617) 542-5542', 4),
    mk('Zalkind Duncan & Bernstein LLP', 'Law', 'Boston', 'https://www.zalkindlaw.com/', '(617) 742-6020', 4),
    mk('Gilman, McLaughlin & Hanrahan, LLP', 'Law', 'Boston', 'https://www.gilmac.com/', '(617) 580-3180', 4),
    mk('Bellotti Law Group', 'Law', 'Cambridge', 'https://www.bellottilaw.com/', '(617) 225-2100', 4),
    mk('Altman & Altman LLP', 'Law', 'Cambridge', 'https://www.altmanllp.com/', '(800) 481-6199', 4),
    mk('Gavagan Law, LLC', 'Law', 'Cambridge', 'https://gavaganlaw.com/', '', 3),
    mk('Jeffrey Glassman Injury Lawyers', 'Law', 'Boston', 'https://www.jeffreysglassman.com/', '', 3),
    
    # CPA / Accounting
    mk('Tristan CPA', 'CPA', 'Boston', 'https://www.tristancpa.com', '(617) 446-3001', 4),
    mk('128 Group CPA', 'CPA', 'Waltham', 'http://www.128cpa.com/', '', 3),
    mk('LGA, LLP CPAs & Business Advisors', 'CPA', 'Boston', 'https://www.lga.cpa/', '', 3),
    mk('Felix G. Cincotta CPA & Consultants', 'CPA', 'Newton', 'https://www.fgccpa.com/', '', 3),
    mk('Dimov Tax CPA', 'CPA', 'Brookline', 'https://dimovtax.com/', '', 3),
    mk('J Chang CPA, LLC', 'CPA', 'Boston', 'https://changcpa.com/', '', 3),
    
    # Financial Advisors
    mk('Blue Hills Wealth Management', 'Financial Advisor', 'Quincy', 'https://www.bluehillswm.com', '', 4),
    mk('TSW Wealth Management', 'Financial Advisor', 'Framingham', 'https://tswmanagement.com/', '', 3),
    mk('Argent Wealth Management', 'Financial Advisor', 'Waltham', 'https://argentwm.com/', '(781) 290-4900', 4),
    mk('Heritage Financial Services', 'Financial Advisor', 'Quincy', 'https://heritagefinancial.net/', '', 3),
]

r = requests.post(BASE, headers=HEADERS, data=json.dumps(records), timeout=120)
print('status', r.status_code)
print('count', len(records))
if r.status_code >= 400:
    print('error', r.text[:500])
else:
    print('ok')
