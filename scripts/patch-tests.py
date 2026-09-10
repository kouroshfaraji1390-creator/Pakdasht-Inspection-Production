from pathlib import Path
p=Path('tests/api.integration.test.mjs')
s=p.read_text(encoding='utf-8')
old="""async function register({username, role='INSPECTOR', organizationName='سازمان آزمون X'}) {\n  return request('/api/auth/register',{method:'POST',body:JSON.stringify({\n    firstName:role==='MANAGER'?'مدیر':'بازرس', lastName:username, personnelCode:username,\n    mobile:'09120000000', username, password:'Integration-Password-2026!', organizationName,\n    role, inviteCode:role==='MANAGER'?'PAKDASHT-DEMO-MGR':''\n  })});\n}"""
new="""async function register({username, role='INSPECTOR', organizationName='سازمان آزمون X'}) {\n  const position=role==='MANAGER'?'UNION_PRESIDENT':'UNION_INSPECTOR';\n  return request('/api/auth/register',{method:'POST',body:JSON.stringify({\n    firstName:role==='MANAGER'?'مدیر':'بازرس', lastName:username, personnelCode:username,\n    mobile:'09120000000', username, password:'Integration-Password-2026!', organizationName,\n    role, position, presidentCode:position==='UNION_PRESIDENT'?'aaa123':''\n  })});\n}"""
if old not in s: raise SystemExit('register fixture target not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
