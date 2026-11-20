import random, sys
from playwright.sync_api import sync_playwright
OUT='/home/claude/kicker/shots'
errs=[]
NAMES=['Nils','Anna','Ben','Cem','Dana','Emil','Fiona','Jonas','Lea','Max','Sophie','Tim','Mia','Paul','Lina','Finn']
def run(page, n_players, mode, tag):
    page.goto('http://localhost:8765/index.html?reset=1')
    page.wait_for_timeout(400)
    if tag=='party11': page.screenshot(path=f'{OUT}/01-home.png')
    page.click(f'[data-act=start][data-mode={mode}]'); page.wait_for_timeout(300)
    cnt=int(page.inner_text('#cnt'))
    while cnt<n_players: page.click('[data-act=count][data-d="1"]'); cnt+=1
    while cnt>n_players: page.click('[data-act=count][data-d="-1"]'); cnt-=1
    for i in range(n_players): page.fill(f'#name-{i}', NAMES[i])
    page.wait_for_timeout(400)
    page.screenshot(path=f'{OUT}/{tag}-02-names.png')
    page.click('[data-act=names-next]'); page.wait_for_timeout(500)
    if mode=='party':
        page.click('[data-act=pick-k][data-k="3"]'); page.wait_for_timeout(300)
        page.screenshot(path=f'{OUT}/{tag}-03-cfg.png')
        page.click('[data-act=pick-k][data-k="4"]')
        page.click('[data-act=party-create]'); page.wait_for_timeout(800)
        page.screenshot(path=f'{OUT}/{tag}-04-live.png')
        st=page.evaluate('__kicker.state.party')
        M=len(st['matches'])
        for i in range(M):
            page.click('.now [data-act=party-result]'); page.wait_for_timeout(450)
            ga,gb=random.randint(2,10),random.randint(2,10)
            for _ in range(ga): page.click('.pm2 button[data-s=a][data-d="1"]')
            for _ in range(gb): page.click('.pm2 button[data-s=b][data-d="1"]')
            if i==0: page.screenshot(path=f'{OUT}/{tag}-05-sheet.png')
            page.click('[data-save]'); page.wait_for_timeout(300)
            if i==3:
                page.click('[data-act=tab][data-t=table]'); page.wait_for_timeout(300)
                page.screenshot(path=f'{OUT}/{tag}-06-table.png')
                page.click('[data-act=tab][data-t=plan]')
        page.wait_for_timeout(1600)
        page.screenshot(path=f'{OUT}/{tag}-07-win.png')
        res=page.evaluate('__kicker.state.party.results')
        assert len(res)==M, 'not all results'
        page.goto('http://localhost:8765/index.html'); page.wait_for_timeout(400)
        assert page.evaluate('Object.keys(__kicker.state.party.results).length')==M, 'reload lost'
    else:
        page.screenshot(path=f'{OUT}/{tag}-03-teams.png')
        page.click('[data-act=team-mode][data-m=manual]'); page.wait_for_timeout(300)
        page.click('[data-act=pool][data-i="0"]'); page.click('[data-act=pool][data-i="1"]'); page.wait_for_timeout(200)
        page.screenshot(path=f'{OUT}/{tag}-03b-manual.png')
        page.click('[data-act=team-mode][data-m=random]'); page.wait_for_timeout(300)
        page.click('[data-act=cup-create]'); page.wait_for_timeout(800)
        page.screenshot(path=f'{OUT}/{tag}-04-live.png')
        k=0; edited=False
        while page.locator('.now [data-act=cup-result]').count():
            page.click('.now [data-act=cup-result]'); page.wait_for_timeout(450)
            if random.random()<.5:
                page.click('details.opt summary')
                for _ in range(random.randint(0,7)): page.click('.ms button[data-s=a][data-d="1"]')
                for _ in range(random.randint(0,7)): page.click('.ms button[data-s=b][data-d="1"]')
            if page.locator('[data-save][disabled]').count():
                page.click(f'#pk-{random.randint(0,1)}')
            if k==0: page.screenshot(path=f'{OUT}/{tag}-05-sheet.png')
            page.click('[data-save]'); page.wait_for_timeout(350)
            k+=1
            if k==4 and not edited:
                edited=True
                page.screenshot(path=f'{OUT}/{tag}-06-bracket.png', full_page=True)
                # Korrektur: erstes gespieltes Spiel drehen
                first=page.evaluate('__kicker.state.cup.history[0]')
                page.click(f'.bm[data-id="{first}"]'); page.wait_for_timeout(400)
                page.click('.pk:not(.on)'); page.click('[data-save]'); page.wait_for_timeout(500)
                if page.locator('[data-ask="1"]').count():
                    page.screenshot(path=f'{OUT}/{tag}-06b-confirm.png'); page.click('[data-ask="1"]'); page.wait_for_timeout(500)
            if k>40: raise Exception('loop')
        page.wait_for_timeout(1600)
        page.screenshot(path=f'{OUT}/{tag}-07-win.png')
        page.click('[data-close]'); page.click('[data-act=tab][data-t=teams]'); page.wait_for_timeout(300)
        page.screenshot(path=f'{OUT}/{tag}-08-teams.png', full_page=True)
        champ=page.evaluate('''(()=>{const s=__kicker.state.cup; return s})()''')
        print(tag,'games played',k)

with sync_playwright() as p:
    b=p.chromium.launch()
    for (vw,vh,suffix) in [(1194,834,'')]:
        ctx=b.new_context(viewport={'width':vw,'height':vh}, device_scale_factor=1, has_touch=True)
        ctx.add_init_script("if (location.search.includes('reset')) localStorage.clear()")
        page=ctx.new_page()
        page.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        page.on('pageerror', lambda e: errs.append(str(e)))
        for n in (8,10,11,12):
            run(page, n, 'party', f'party{n}')
        for n in (8,10,11,12,5,16):
            run(page, n, 'cup', f'cup{n}')
    # Phone + iPad hoch
    ctx=b.new_context(viewport={'width':375,'height':667}, device_scale_factor=1, has_touch=True)
    ctx.add_init_script("if (location.search.includes('reset')) localStorage.clear()")
    page=ctx.new_page(); page.on('pageerror', lambda e: errs.append(str(e)))
    run(page, 11, 'cup', 'phone-cup11'); run(page, 9, 'party', 'phone-party9')
    ctx=b.new_context(viewport={'width':834,'height':1194}, device_scale_factor=1, has_touch=True)
    ctx.add_init_script("if (location.search.includes('reset')) localStorage.clear()")
    page=ctx.new_page(); page.on('pageerror', lambda e: errs.append(str(e)))
    run(page, 12, 'party', 'portrait-party12')
    b.close()
print('ERRORS:', [e for e in errs if 'sw.js' not in e and 'manifest' not in e] or 'none')
