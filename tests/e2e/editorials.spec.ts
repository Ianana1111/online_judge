import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { loadEditorial } from "../../scripts/editorials/evidence";
import { localizeEditorial } from "../../packages/shared/src/editorial";

const user={id:"c000000000000000000000001",handle:"reader",email:"reader@example.test",role:"USER",plan:"PRO",settings:{profileSetupDismissed:true,defaultLanguage:"cpp17"},bio:"",avatarUrl:null,school:null,isStudent:false,hasPassword:true,csrfToken:"test"};

test("official editorial is lazy, keyboard reachable, responsive, and copies the exact validated source",async({page},info)=>{
  test.skip(process.env.RUN_FULL_SITE_E2E!=="1","Requires the isolated server-rendered problem fixture");
  const url=new URL(process.env.DATABASE_URL!);
  if(url.hostname!=="127.0.0.1"||url.port!=="55432"||url.pathname!=="/oj_test")throw new Error("Disposable database required");
  const requireApi=createRequire(resolve(__dirname,"../../apps/api/package.json")),{PrismaClient}=requireApi("@prisma/client"),db=new PrismaClient();
  const problem=await db.problem.create({data:{slug:`editorial-${randomUUID()}`,title:"詳解閱讀測試",statementMd:"Read an integer and print it.\n\n```\n 0  -2\n 9   2\n-4   1\n```",samples:{create:{ord:1,input:"1\n",output:"1\n"}},testCases:{create:{ord:1,input:"1\n",output:"1\n"}}}});
  const editorial=(await loadEditorial(process.cwd(),"uva-100-the-3n-1-problem"))!;editorial.slug=problem.slug;
  let requests=0,mode="NOT_READY",copied="";
  let accessExpiresAt:string|null=null;
  await page.exposeFunction("captureEditorialCopy",(text:string)=>{copied=text;});
  await page.addInitScript((theme)=>{
    localStorage.setItem("theme",theme);
    Object.defineProperty(navigator,"clipboard",{value:{writeText:(text:string)=>(window as unknown as {captureEditorialCopy:(text:string)=>Promise<void>}).captureEditorialCopy(text)}});
  },info.project.name==="mobile"?"dark":"light");
  await page.route("http://127.0.0.1:55440/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==="/auth/me")return route.fulfill({json:user});
    if(path==="/contests/me")return route.fulfill({json:[]});
    if(path==="/notifications")return route.fulfill({json:{items:[],unreadCount:0}});
    if(path==="/billing/me")return route.fulfill({json:{plan:"FREE",submits:{used:0,limit:20},runs:{used:0,limit:20}}});
    if(path.endsWith("/editorial")){
      requests++;
      if(mode==="ERROR")return route.fulfill({status:503,json:{message:"Unavailable"}});
      const locale=new URL(route.request().url()).searchParams.get("locale")==="en"?"en":"zh-TW";
      return route.fulfill({json:mode==="AVAILABLE"?{status:mode,editorial:localizeEditorial(editorial,locale),revision:1,verifiedAt:"2026-09-21T00:00:00Z",publishedAt:"2026-09-21T00:00:00Z",accessExpiresAt}:{status:mode}});
    }
    return route.fulfill({json:{items:[],total:0,page:1}});
  });
  try{
    await page.goto(`/problems/${problem.slug}`);
    await expect(page.getByText("Read an integer and print it.",{exact:true})).toBeVisible();
    await expect(page.locator("pre.statement-matrix")).toHaveText("0  -2\n9   2\n-4   1");
    if (info.project.name !== "mobile") await expect.poll(() => page.evaluate(() => ({
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      bodyLocked: document.body.classList.contains("problem-workspace-active"),
    }))).toEqual({ htmlOverflow: "hidden", bodyOverflow: "hidden", bodyLocked: true });
    expect(requests).toBe(0);
    const tab=page.getByRole("tab",{name:"官方詳解",exact:true});
    await tab.click();await expect(page.getByText("這題的官方詳解正在準備中")).toBeVisible();
    const panel=page.locator("#problem-tabpanel-editorial");
    // Development StrictMode can abort and restart the first request. The contract
    // under test is zero preloads, not an exact transport count after opening.
    expect(requests).toBeGreaterThan(0);
    // Remount to exercise the zero-retention cache and each server state.
    const reopen=async(next:string)=>{mode=next;await tab.focus();await page.keyboard.press("ArrowLeft");await expect(tab).toHaveAttribute("aria-selected","false");await page.keyboard.press("ArrowRight");await expect(tab).toHaveAttribute("aria-selected","true");};
    await reopen("AVAILABLE");
    await expect(panel.getByRole("heading",{name:editorial.title,exact:true})).toBeVisible();
    await expect(panel.locator("pre code")).toHaveText(editorial.solutions[0].sourceCode);
    await panel.getByRole("button",{name:"複製 C++17 程式碼",exact:true}).click();
    await expect.poll(()=>copied).toBe(editorial.solutions[0].sourceCode);
    await expect(panel.getByText("已複製",{exact:true})).toBeVisible();
    await panel.getByRole("button",{name:"English",exact:true}).click();
    await expect(panel.getByRole("heading",{name:editorial.translations!.en.title,exact:true})).toBeVisible();
    await expect(panel.locator("pre code")).toHaveText(editorial.solutions[0].sourceCode);
    await panel.getByRole("button",{name:"繁體中文",exact:true}).click();
    await expect(panel.getByRole("heading",{name:editorial.title,exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include("#problem-tabpanel-editorial").withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();expect(audit.violations).toEqual([]);
    await page.screenshot({path:info.outputPath("official-editorial.png"),fullPage:true});
    await reopen("PRO_REQUIRED");await expect(panel.locator("pre")).toHaveCount(0);await expect(panel.getByRole("link",{name:"查看 Pro 方案"})).toHaveAttribute("href","/upgrade");
    mode="AVAILABLE";await panel.getByRole("button",{name:"我已升級，重新確認"}).click();await expect(panel.locator("pre code")).toHaveText(editorial.solutions[0].sourceCode);
    await reopen("AUTH_REQUIRED");await expect(panel.locator("pre")).toHaveCount(0);await expect(panel.getByRole("link",{name:"登入並查看 Pro 權益"})).toHaveAttribute("href","/login");
    await reopen("REVIEW_REQUIRED");await expect(panel).toContainText("這題的詳解正在重新驗證");await expect(panel.locator("pre")).toHaveCount(0);
    await reopen("EXAM_LOCKED");await expect(panel).toContainText("先完成測驗");await expect(panel.locator("pre")).toHaveCount(0);
    mode="AVAILABLE";await panel.getByRole("button",{name:"重新確認",exact:true}).click();await expect(panel.locator("pre code")).toHaveText(editorial.solutions[0].sourceCode);
    await reopen("ERROR");await expect(panel.getByRole("alert")).toBeVisible();
    mode="AVAILABLE";await panel.getByRole("button",{name:"重試",exact:true}).click();await expect(panel.locator("pre code")).toHaveText(editorial.solutions[0].sourceCode);
    accessExpiresAt=new Date(Date.now()+2_000).toISOString();await reopen("AVAILABLE");
    await expect(panel.locator("pre code")).toHaveText(editorial.solutions[0].sourceCode);mode="PRO_REQUIRED";
    await expect(panel.getByRole("link",{name:"查看 Pro 方案"})).toBeVisible();await expect(panel.locator("pre")).toHaveCount(0);
  }finally{await db.problem.delete({where:{id:problem.id}});await db.$disconnect();}
});

test("active exam tab explains the lock without requesting or rendering an answer",async({page})=>{
  const problem={id:"editorial-exam-problem",slug:"editorial-exam",title:"Exam editorial fixture",statementMd:"Read an integer.",tags:[],samples:[{ord:1,input:"1\n",output:"1\n"}],judgeable:true,checkerType:"IGNORE_TRAILING_WS",timeLimitMs:1000,memoryLimitKb:65536,difficulty:1,cpeAppearances:null,uvaId:null};
  const contest={id:"editorial-exam-contest",slug:"cpe-editorial-exam",title:"Editorial exam",kind:"CPE",startAt:null,durationMin:180,penaltyMin:20,isPublic:true,problems:[{ord:1,label:"A",problem}],myParticipant:{id:"editorial-exam-participant",startedAt:new Date().toISOString(),endsAt:new Date(Date.now()+3600_000).toISOString(),status:"RUNNING",attemptNumber:1},solvedProblemIds:[],myAttempts:[],serverNow:new Date().toISOString()};
  let answerRequests=0;
  await page.route("http://127.0.0.1:55440/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==="/auth/me")return route.fulfill({json:user});
    if(path===`/contests/${contest.id}`)return route.fulfill({json:contest});
    if(path==="/contests/me")return route.fulfill({json:[]});
    if(path.endsWith("/editorial")){answerRequests++;return route.fulfill({json:{status:"NOT_READY"}});}
    if(path.endsWith("/scoreboard"))return route.fulfill({json:{standings:[],frozen:false}});
    if(path==="/notifications")return route.fulfill({json:{items:[],unreadCount:0}});
    if(path==="/billing/me")return route.fulfill({json:{plan:"FREE",submits:{used:0,limit:20},runs:{used:0,limit:20}}});
    return route.fulfill({json:{items:[],total:0,page:1}});
  });
  await page.goto(`/contests/${contest.id}`);await page.getByRole("button",{name:`A ${problem.title}`,exact:true}).click();
  await page.getByRole("tab",{name:"官方詳解",exact:true}).click();
  await expect(page.locator("#problem-tabpanel-editorial")).toContainText("先完成測驗");
  expect(answerRequests).toBe(0);
});
