window.__ModuleLoader__.load({
  id: "dsh-jira-tasks",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");
    var h = React.createElement;

    var CSS = ".jt-root{box-sizing:border-box;width:100%;padding:2px 0 6px;flex:none;display:flex;flex-direction:column}"
      + "/* composerStack 是 flex-direction:column：order:99 把面板排到输入卡之后，即输入框下方。 */"
      + ".jt-hero{order:99;padding:0 var(--dsh-composer-side-clearance, 16px)}"
      + ".jt-panel{box-sizing:border-box;width:100%;max-width:var(--dsh-composer-card-max-width, 780px);margin:0 auto;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.07));border-radius:10px;overflow:hidden}"
      + ".jt-header{display:flex;align-items:center;gap:8px;min-height:30px;padding:2px 6px 2px 4px}"
      + ".jt-toggle{display:flex;align-items:center;gap:6px;flex:1;min-width:0;background:none;border:none;cursor:pointer;color:var(--dsw-alias-label-primary, #222);padding:4px 6px;border-radius:6px;font-size:12px;text-align:left}"
      + ".jt-toggle:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1))}"
      + ".jt-chevron{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jt-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
      + ".jt-badge{flex:none;font-size:11px;padding:0 6px;border-radius:999px;background:var(--dsw-alias-button-primary-fill, #2f6fed);color:var(--dsw-alias-label-primary-foreground, #fff)}"
      + ".jt-actions{display:flex;align-items:center;gap:2px;flex:none}"
      + ".jt-action{width:24px;height:24px;border:none;background:none;cursor:pointer;border-radius:6px;color:var(--dsw-alias-label-secondary, #666);font-size:13px;line-height:1}"
      + ".jt-action:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14))}"
      + ".jt-body{padding:0 8px 8px}"
      + ".jt-hint{color:var(--dsw-alias-label-secondary, #666);font-size:12px;line-height:1.7}"
      + ".jt-error{color:var(--dsw-alias-state-error-primary, #d93026);font-size:12px;line-height:1.7;word-break:break-word}"
      + ".jt-empty{color:var(--dsw-alias-label-secondary, #666);font-size:12px;padding:4px 0}"
      + ".jt-list{margin:0;padding:2px 0;list-style:none;max-height:190px;overflow-y:auto;display:flex;flex-direction:column;gap:2px}"
      + ".jt-item{margin:0;padding:0;list-style:none}"
      + ".jt-row{display:flex;align-items:baseline;gap:8px;padding:4px 6px;border-radius:6px;text-decoration:none;color:var(--dsw-alias-label-primary, #222)}"
      + ".jt-row:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.09))}"
      + ".jt-key{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--dsw-alias-brand-primary, #2f6fed);font-weight:600}"
      + ".jt-summary{flex:1;min-width:0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
      + ".jt-meta{flex:none;display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jt-chip{padding:0 6px;border-radius:999px;font-size:11px;line-height:16px;white-space:nowrap;color:var(--dsw-alias-label-secondary, #888);background:color-mix(in srgb, var(--dsw-alias-label-secondary, #888) 12%, transparent)}"
      + ".jt-chip-new{color:var(--dsw-alias-state-warn-primary, #b76e00);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary, #b76e00) 14%, transparent)}"
      + ".jt-chip-progress{color:var(--dsw-alias-brand-primary, #2f6fed);background:color-mix(in srgb, var(--dsw-alias-brand-primary, #2f6fed) 12%, transparent)}"
      + ".jt-field{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}"
      + ".jt-field label{font-size:12px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jt-input{box-sizing:border-box;width:100%;padding:5px 8px;font-size:12px;font-family:inherit;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.32));border-radius:6px;background:var(--dsw-alias-bg-base, #fff);color:var(--dsw-alias-label-primary, #222);outline:none}"
      + ".jt-input:focus{border-color:var(--dsw-alias-brand-primary, #2f6fed)}"
      + ".jt-textarea{min-height:64px;resize:vertical;line-height:1.5}"
      + ".jt-buttons{display:flex;gap:8px;justify-content:flex-end}"
      + ".jt-btn{padding:4px 12px;font-size:12px;border-radius:6px;cursor:pointer;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.32));background:transparent;color:var(--dsw-alias-label-primary, #222);text-decoration:none;white-space:nowrap}"
      + ".jt-btn:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1));opacity:1}"
      + ".jt-btn-primary{background:var(--dsw-alias-button-primary-fill, #2f6fed);border-color:transparent;color:var(--dsw-alias-label-primary-foreground, #fff)}"
      + ".jt-btn-primary:hover{background:var(--dsw-alias-button-primary-hover, #3a7bfd)}"
      + ".jt-btn:disabled{opacity:.55;cursor:default}"
      // 列表行内的紧凑按钮（与 .jt-btn 同源，只是尺寸更小）
      + ".jt-btn-mini{padding:2px 8px;font-size:11.5px;border-radius:6px;flex:none;align-self:center}"
      // 工单行：左侧仍是跳 JIRA 网页的外链，右侧是“详情”按钮
      + ".jt-rowwrap{display:flex;align-items:stretch;gap:4px}"
      + ".jt-rowwrap .jt-row{flex:1;min-width:0}"
      + ".jt-linklike{background:none;border:none;padding:0;cursor:pointer;color:var(--dsw-alias-brand-primary, #2f6fed);font-size:12px;text-decoration:underline}"
      + ".jt-set-card{box-sizing:border-box;list-style:none;margin:0;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05));border-radius:10px;padding:10px 12px}"
      + ".jt-set-head{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}"
      + ".jt-set-title{font-weight:600;font-size:13px;color:var(--dsw-alias-label-primary, #222)}"
      + ".jt-set-desc{font-size:12px;color:var(--dsw-alias-label-secondary, #666);line-height:1.6}"
      + ".jt-probe{display:flex;align-items:center;gap:6px;margin:0 0 8px;font-size:12px;color:var(--dsw-alias-label-secondary, #666);line-height:1.6;word-break:break-word}"
      + ".jt-dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-label-secondary, #999)}"
      + ".jt-dot-ok{background:var(--dsw-alias-state-success-primary, #1a9d4f)}"
      + ".jt-dot-fail{background:var(--dsw-alias-state-error-primary, #d93026)}"
      + ".jt-dot-testing{background:var(--dsw-alias-state-warn-primary, #b76e00)}"
      // 设置对话框左侧导航的整页形态（settings.section）：
      + ".jt-set-page{box-sizing:border-box;width:100%;max-width:760px;display:flex;flex-direction:column;gap:12px}"
      + ".jt-page-title{margin:0;font-size:18px;font-weight:600;line-height:26px;color:var(--dsw-alias-label-primary, #222)}"
      + ".jt-page-intro{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jt-set-form{display:flex;flex-direction:column}";

    // ---- 任务统计页（左侧栏入口）：样式 ----
    // 面板渲染在 root 级 main 槽位（整页），外壳、文字、边框全部走 --dsw-alias-*
    // 主题令牌，亮/暗主题自动跟随；圆角/间距与宿主设置页、插件页保持一致。
    var STATS_CSS = ".jtst-page{box-sizing:border-box;height:100%;overflow-y:auto;background:var(--dsw-alias-bg-base);padding:calc(var(--dsh-frame-top-clearance,0px) + 20px) 28px 48px}"
      + ".jtst-inner{max-width:1160px;margin:0 auto}"
      + ".jtst-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}"
      + ".jtst-headmain{min-width:0}"
      + ".jtst-title{margin:0;font-size:16px;font-weight:600;line-height:1.4;color:var(--dsw-alias-label-primary)}"
      + ".jtst-sub{margin:4px 0 0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px}"
      + ".jtst-label{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}"
      + ".jtst-combo{position:relative;flex:none;width:260px;max-width:100%}"
      + ".jtst-combo-input{box-sizing:border-box;width:100%;height:30px;padding:0 28px 0 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;outline:none;text-transform:uppercase}"
      + ".jtst-combo-input::placeholder{text-transform:none;font-family:inherit}"
      + ".jtst-combo-input:focus{border-color:var(--dsw-alias-brand-primary)}"
      + ".jtst-combo-toggle{position:absolute;top:0;right:0;width:26px;height:30px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);font-size:10px;cursor:pointer;border-radius:0 8px 8px 0}"
      + ".jtst-combo-toggle:hover{color:var(--dsw-alias-label-primary)}"
      + ".jtst-combo-list{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:30;margin:0;padding:4px;list-style:none;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;box-shadow:var(--dsw-shadow-lv2, 0 10px 28px rgba(0,0,0,.22));max-height:260px;overflow-y:auto}"
      + ".jtst-combo-option{display:flex;align-items:baseline;gap:8px;padding:5px 8px;border-radius:6px;cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-primary)}"
      + ".jtst-combo-option.is-active{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 14%, transparent)}"
      + ".jtst-combo-key{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);white-space:nowrap}"
      + ".jtst-combo-hint{margin-left:auto;font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
      + ".jtst-combo-empty{padding:8px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:background .14s ease,border-color .14s ease}"
      + ".jtst-btn:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}"
      + ".jtst-btn:disabled{opacity:.55;cursor:default}"
      + ".jtst-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base);font-weight:500}"
      + ".jtst-btn-primary:hover{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base);filter:brightness(.94)}"
      + ".jtst-btn:focus-visible,.jtst-combo-input:focus-visible,.jtst-combo-toggle:focus-visible,.jtst-page-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}"
      + ".jtst-status{margin-left:auto;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}"
      + ".jtst-notice{display:flex;align-items:center;gap:8px;margin:0 0 16px;padding:8px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:12.5px;line-height:1.6;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-notice-warn{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 45%, transparent);color:var(--dsw-alias-state-warn-primary)}"
      + ".jtst-error{margin:0 0 16px;padding:10px 12px;border-radius:8px;border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);color:var(--dsw-alias-state-error-primary);font-size:12.5px;line-height:1.6;word-break:break-word}"
      + ".jtst-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:56px 16px;color:var(--dsw-alias-label-secondary);font-size:13px}"
      + ".jtst-spin-svg{display:block;flex:none;animation:jtst-spin .8s linear infinite;transform-origin:center}"
      + "@keyframes jtst-spin{to{transform:rotate(360deg)}}"
      + "@media (prefers-reduced-motion: reduce){.jtst-spin-svg{animation:none}.jtst-btn{transition:none}}"
      + ".jtst-idle{padding:44px 16px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:2}"
      + ".jtst-empty{padding:36px 16px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px}"
      + ".jtst-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px;margin-bottom:16px}"
      + ".jtst-card{min-width:0;padding:12px 14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px}"
      + ".jtst-card-label{margin-bottom:6px;font-size:12px;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-card-value{font-size:24px;line-height:1.15;font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}"
      + ".jtst-card-note{margin-top:4px;font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-section{min-width:0;padding:12px 14px 14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px}"
      + ".jtst-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:10px}"
      + ".jtst-section-title{margin:0;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}"
      + ".jtst-section-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}"
      + ".jtst-bar-track{display:block;height:6px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-label-secondary) 16%, transparent);overflow:hidden}"
      + ".jtst-bar-fill{display:block;height:100%;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-brand-primary) 80%, transparent)}"
      + ".jtst-bar-fill-done{background:var(--dsw-alias-state-success-primary)}"
      + ".jtst-tablewrap{overflow-x:auto}"
      + ".jtst-table{width:100%;min-width:760px;border-collapse:collapse;font-size:12.5px}"
      + ".jtst-table th{text-align:left;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:11.5px;font-weight:500;color:var(--dsw-alias-label-secondary);white-space:nowrap}"
      + ".jtst-table td{padding:7px 8px;border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 60%, transparent);vertical-align:middle;color:var(--dsw-alias-label-primary)}"
      + ".jtst-table tr:last-child td{border-bottom:none}"
      + ".jtst-table .jtst-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}"
      + ".jtst-pager{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-pager-info{font-variant-numeric:tabular-nums}"
      + ".jtst-page-btn{height:24px;padding:0 10px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;cursor:pointer}"
      + ".jtst-page-btn:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}"
      + ".jtst-page-btn:disabled{opacity:.5;cursor:default}"
      + ".jtst-vlink{border:none;background:none;padding:0;cursor:pointer;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary);border-radius:4px}"
      + ".jtst-vlink:hover{text-decoration:underline}"
      + ".jtst-section-title:focus{outline:none}"
      + ".jtst-vlink:focus-visible,.jtst-linkbtn:focus-visible,.jtst-sortbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:4px}"
      + ".jtst-section-actions{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;justify-content:flex-end}"
      + ".jtst-linkbtn{border:none;background:none;padding:0;cursor:pointer;color:var(--dsw-alias-brand-primary);font:inherit;font-size:11.5px;text-decoration:underline;white-space:nowrap}"
      + ".jtst-sortbtn{display:inline-flex;align-items:center;gap:4px;border:none;background:none;padding:0;margin:0;cursor:pointer;color:inherit;font:inherit;font-size:11.5px;font-weight:500;white-space:nowrap}"
      + ".jtst-sortbtn:hover{color:var(--dsw-alias-label-primary)}"
      + ".jtst-sortbtn.is-active{color:var(--dsw-alias-brand-primary)}"
      + ".jtst-sort-ind{font-size:9px;opacity:.85}"
      + ".jtst-issue-table{min-width:900px}"
      + ".jtst-issue-table td{white-space:nowrap}"
      + ".jtst-issue-summary{max-width:380px;overflow:hidden;text-overflow:ellipsis}"
      + ".jtst-issue-key{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary);text-decoration:none}"
      + ".jtst-issue-key:hover{text-decoration:underline}"
      + ".jtst-keycell{display:inline-flex;align-items:center;gap:6px}"
      + ".jtst-mine{margin-left:6px;padding:0 5px;border-radius:999px;font-size:10px;line-height:16px;background:color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);color:var(--dsw-alias-brand-primary)}"
      + ".jtst-issue-table tr.is-mine{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 6%, transparent)}"
      + ".jtst-chip{display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:999px;font-size:11px;white-space:nowrap;background:color-mix(in srgb, var(--dsw-alias-label-secondary) 12%, transparent);color:var(--dsw-alias-label-secondary)}"
      + ".jtst-chip-unreleased{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);color:var(--dsw-alias-brand-primary)}"
      + ".jtst-chip-released{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent);color:var(--dsw-alias-state-success-primary)}"
      + ".jtst-chip-archived{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent);color:var(--dsw-alias-label-secondary)}"
      + ".jtst-chip-extra{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent);color:var(--dsw-alias-state-warn-primary)}"
      + ".jtst-progress{display:flex;align-items:center;gap:8px;min-width:110px}"
      + ".jtst-progress .jtst-bar-track{flex:1}"
      + ".jtst-progress-text{min-width:36px;text-align:right;font-size:11.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}"
      + ".jtst-foot{margin-top:12px;font-size:11.5px;line-height:1.8;color:var(--dsw-alias-label-secondary)}"
      + ".jtst-pager .jtst-page-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}";

    // ---- 工单详情面板样式 ----
    // 任务面板（jt- 语境）与统计页（jtst- 语境）共用同一个详情面板，因此用一套
    // 独立的 jtd- 前缀；配色/圆角/字号全部复用文件里已有的 --dsw-alias-* 令牌与
    // jt-chip / jt-btn 组件，不另起一套设计语言。
    var DETAIL_CSS = ".jtd-root{box-sizing:border-box;width:100%;margin-top:8px;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-2, rgba(127,127,127,.05));border-radius:10px;overflow:hidden}"
      + ".jtd-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28))}"
      + ".jtd-key{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary, #2f6fed)}"
      + ".jtd-title{flex:1;min-width:160px;font-size:13px;font-weight:600;line-height:1.5;color:var(--dsw-alias-label-primary, #222);word-break:break-word}"
      + ".jtd-actions{display:flex;align-items:center;gap:6px;flex:none;flex-wrap:wrap}"
      + ".jtd-body{padding:8px 10px;display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto}"
      + ".jtd-loading{display:flex;align-items:center;gap:8px}"
      + ".jtd-sec{display:flex;flex-direction:column;gap:8px;min-width:0}"
      + ".jtd-sec-title{margin:0;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px 14px}"
      + ".jtd-kv{display:flex;flex-direction:column;gap:1px;min-width:0}"
      + ".jtd-kv-k{font-size:11px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-kv-v{font-size:12px;color:var(--dsw-alias-label-primary, #222);word-break:break-word}"
      + ".jtd-text{margin:0;font-size:13px;line-height:1.8;color:var(--dsw-alias-label-primary, #222);white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;max-width:78ch}"
      + ".jtd-chips{display:flex;flex-wrap:wrap;gap:4px}"
      + ".jtd-tablewrap{overflow-x:auto}"
      + ".jtd-table{width:100%;min-width:520px;border-collapse:collapse;font-size:12px}"
      + ".jtd-table th{text-align:left;padding:4px 6px;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary, #666);white-space:nowrap}"
      + ".jtd-table td{padding:5px 6px;border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgba(127,127,127,.28)) 60%, transparent);vertical-align:middle;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-table tr:last-child td{border-bottom:none}"
      + ".jtd-file{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;word-break:break-all}"
      + ".jtd-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}"
      + ".jtd-comments{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}"
      + ".jtd-comment{border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));border-radius:8px;padding:6px 8px}"
      + ".jtd-comment-head{display:flex;align-items:baseline;gap:8px;font-size:11.5px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-comment-author{font-weight:600;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-notice{display:flex;flex-direction:column;gap:4px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05));border-radius:8px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-notice-ok{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary, #1a9d4f) 45%, transparent)}"
      + ".jtd-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.6;word-break:break-all;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}"
      + ".jtd-item{display:flex;gap:8px;align-items:baseline;font-size:11.5px;flex-wrap:wrap}"
      + ".jtd-toggle{border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.07));color:var(--dsw-alias-label-primary, #222);border-radius:6px;padding:2px 8px;font-size:11.5px;cursor:pointer;line-height:1.6;white-space:nowrap}"
      + ".jtd-toggle:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14))}"
      + ".jtd-toggle:disabled{opacity:.55;cursor:default}"

      + ".jtd-root{width:100%;margin:0;border:none;background:none;border-radius:0;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow:hidden}"
      + ".jtd-head{flex:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05))}"
      + ".jtd-headmain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}"
      + ".jtd-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:10px 12px;overscroll-behavior:contain}"
      + ".jtd-back{border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.07));color:var(--dsw-alias-label-primary, #222);border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer;line-height:1.6;white-space:nowrap;flex:none}"
      + ".jtd-back:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14))}"
      + ".jtd-root-compact{min-width:0}"
      + ".jtd-root-full{width:100%;border:none;background:none;margin:0}"
      + ".jtd-root-full .jtd-head{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));border-radius:12px 12px 0 0;padding:12px 14px}"
      + ".jtd-root-full .jtd-key{font-size:18px}"
      + ".jtd-root-full .jtd-title{font-size:20px}"
      + ".jtd-c-body{display:flex;flex-direction:column;gap:12px}"
      + ".jtd-c-actions{display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28))}"
      + ".jtd-btn-primary{border:1px solid transparent;background:var(--dsw-alias-button-primary-fill, #2f6fed);color:var(--dsw-alias-label-primary-foreground, #fff);border-radius:6px;padding:3px 10px;font-size:11.5px;cursor:pointer;line-height:1.6;white-space:nowrap}"
      + ".jtd-btn-primary:disabled{opacity:.55;cursor:default}"
      + ".jtd-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:300}"
      + ".jtd-popover{box-sizing:border-box;z-index:301;max-height:min(70vh,calc(100vh - 32px));overflow:hidden;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.34));border-radius:12px;background:var(--dsw-alias-bg-base, #fff);box-shadow:var(--dsw-shadow-lv2, 0 12px 34px rgba(0,0,0,.24))}"
      + ".jtd-popover .jtd-root{border:none;border-radius:0;margin:0;overflow-y:auto;background:none}"
      + ".jtd-modal{position:fixed;z-index:301;top:50%;left:50%;transform:translate(-50%,-50%);width:min(1080px,calc(100vw - 48px));height:min(860px,calc(100vh - 56px));max-height:calc(100vh - 56px);overflow:hidden;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.34));border-radius:14px;background:var(--dsw-alias-bg-base, #fff);box-shadow:var(--dsw-shadow-lv2, 0 18px 48px rgba(0,0,0,.28))}"
      + ".jtd-modal .jtd-root{overflow-y:auto;border-radius:0;margin:0;background:none}"
      + ".jtd-f-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,360px);gap:16px;min-height:0}"
      + ".jtd-f-main{display:flex;flex-direction:column;gap:12px;min-width:0}"
      + ".jtd-side{display:flex;flex-direction:column;gap:14px;min-width:0;position:sticky;top:0;align-self:start}"
      + ".jtd-tabs{display:flex;align-items:center;gap:2px;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));padding-bottom:0;position:sticky;top:0;z-index:3;background:var(--dsw-alias-bg-base, transparent);padding-top:2px}"
      + ".jtd-tab{border:none;background:none;cursor:pointer;padding:7px 12px;font-size:12.5px;color:var(--dsw-alias-label-secondary, #666);border-bottom:2px solid transparent;border-radius:6px 6px 0 0}"
      + ".jtd-tab:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1))}"
      + ".jtd-tab.is-active{color:var(--dsw-alias-label-primary, #222);border-bottom-color:var(--dsw-alias-brand-primary, #2f6fed);font-weight:600}"
      + ".jtd-grid-1{grid-template-columns:minmax(0,1fr)}"
      + ".jtd-c-addbox{display:flex;flex-direction:column;gap:8px}"
      + ".jtd-c-addhead{display:flex;align-items:center;gap:8px}"
      + ".jtd-c-addtitle{flex:1;min-width:0;font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-c-check{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-primary, #222);cursor:pointer}"
      + ".jtd-c-atts{display:flex;flex-direction:column;gap:6px;min-width:0}"
      + ".jtd-c-attoolbar{display:flex;align-items:center;gap:6px}"
      + ".jtd-c-atthint{flex:1;min-width:0;font-size:11.5px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-c-attlist{display:flex;flex-direction:column;gap:2px;max-height:200px;overflow-y:auto;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.24));border-radius:8px;padding:4px}"
      + ".jtd-c-attrow{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:3px 4px;border-radius:5px;cursor:pointer;min-width:0}"
      + ".jtd-c-attrow:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1))}"
      + ".jtd-c-attrow.is-disabled{opacity:.5;cursor:not-allowed}"
      + ".jtd-c-attname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}"
      + ".jtd-c-attsize{flex:none;color:var(--dsw-alias-label-secondary, #666);font-variant-numeric:tabular-nums}"
      + ".jtd-c-attstate{flex:none;max-width:42%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-c-attstate.is-ok{color:var(--dsw-alias-state-success-primary, #1a9d4f)}"
      + ".jtd-c-attstate.is-bad{color:var(--dsw-alias-state-error-primary, #d93026)}"
      + ".jtd-c-note{font-size:11.5px;color:var(--dsw-alias-label-secondary, #666);line-height:1.6}"
      + ".jtd-page{box-sizing:border-box;height:100%;overflow-y:auto;background:var(--dsw-alias-bg-base);padding:calc(var(--dsh-frame-top-clearance,0px) + 20px) 28px 48px}"
      + ".jtd-inner{max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:16px;min-width:0}"
      + ".jtd-phead{display:flex;align-items:center;gap:12px;flex-wrap:wrap}"
      + ".jtd-pheadmain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}"
      + ".jtd-ptitle{margin:0;font-size:20px;font-weight:650;line-height:1.3;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-psub{margin:0;font-size:12px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-pactions{display:flex;align-items:center;gap:6px;flex:none}"
      + ".jtd-root-page{display:block;width:100%;margin:0;border:none;background:none;border-radius:0;overflow:visible;flex:none}"
      + ".jtd-sectitle{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}"
      + ".jtd-h2{margin:0;font-size:16px;font-weight:600;line-height:1.4;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-pagebody{display:flex;flex-direction:column;gap:16px}"
      + ".jtd-c-ok{color:var(--dsw-alias-state-success-primary, #1a9d4f);font-size:11.5px}"
      + ".jtd-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,320px);gap:26px;align-items:start}"
      + ".jtd-maincol{min-width:0;display:flex;flex-direction:column;gap:18px}"
      + ".jtd-rail{position:sticky;top:52px;display:flex;flex-direction:column;gap:14px;min-width:0}"
      + ".jtd-card{border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));border-radius:10px;padding:12px 14px;background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.04));display:flex;flex-direction:column;gap:8px}"
      + ".jtd-card-title{margin:0;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-metadata{display:flex;flex-direction:column;gap:7px}"
      + ".jtd-meta-row{display:grid;grid-template-columns:68px minmax(0,1fr);gap:10px;align-items:baseline}"
      + ".jtd-meta-k{font-size:11.5px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-meta-v{font-size:12.5px;color:var(--dsw-alias-label-primary, #222);word-break:break-word}"
      + ".jtd-attlist{display:flex;flex-direction:column}"
      + ".jtd-att-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1px 8px;padding:6px 0;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18))}"
      + ".jtd-att-item:last-child{border-bottom:none}"
      + ".jtd-att-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
      + ".jtd-att-size{font-size:11px;color:var(--dsw-alias-label-secondary, #666);font-variant-numeric:tabular-nums;white-space:nowrap}"
      + ".jtd-att-foot{grid-column:1 / 3;display:flex;align-items:center;gap:6px}"
      + ".jtd-section{display:flex;flex-direction:column;gap:8px;min-width:0}"
      + ".jtd-section-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:6px;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.24))}"
      + ".jtd-section-title{margin:0;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-section-meta{font-size:11px;color:var(--dsw-alias-label-tertiary, #999);font-variant-numeric:tabular-nums}"
      + ".jtd-tag{display:inline-flex;margin-left:6px;border-radius:20px;padding:0 6px;font-size:10px;line-height:1.7;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));color:var(--dsw-alias-label-tertiary, #999);vertical-align:middle}"
      + ".jtd-clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap;word-break:break-word}"
      + ".jtd-field-row.is-template .jtd-field-v{color:var(--dsw-alias-label-tertiary, #999)}"
      + ".jtd-field-k.is-unresolved{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;opacity:.75}"
      + ".jtd-prose{display:flex;flex-direction:column;gap:2px}"
      + ".jtd-wiki-p{margin:0;font-size:13px;line-height:1.85;color:var(--dsw-alias-label-primary, #222);white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;max-width:78ch}"
      + ".jtd-wiki-h{margin:14px 0 2px;font-size:13.5px;font-weight:600;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-bullets{margin:2px 0;padding-left:20px;display:flex;flex-direction:column;gap:3px;font-size:13px;line-height:1.8;color:var(--dsw-alias-label-primary, #222);max-width:78ch}"
      + ".jtd-link{color:var(--dsw-alias-brand-primary, #2f6fed);text-decoration:underline;text-underline-offset:2px;overflow-wrap:anywhere}"
      + ".jtd-imglink{display:inline-flex;align-items:center;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));border-radius:6px;padding:0 8px;font-size:11px;line-height:1.9;color:var(--dsw-alias-brand-primary, #2f6fed);text-decoration:none;background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05))}"
      + ".jtd-imglink:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.12))}"
      + ".jtd-imgbox{display:inline-flex;flex-direction:column;gap:4px;align-items:flex-start;margin:4px 0}"
      + ".jtd-img{display:block;max-width:100%;max-height:420px;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));border-radius:8px;background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05))}"
      + ".jtd-imgtools{display:flex;align-items:center;gap:6px}"
      + ".jtd-more{align-self:flex-start;border:none;background:none;padding:2px 0;font-size:12px;color:var(--dsw-alias-brand-primary, #2f6fed);cursor:pointer;font-family:inherit}"
      + ".jtd-muted{font-size:12px;color:var(--dsw-alias-label-tertiary, #999)}"
      + ".jtd-fields{margin:0;display:flex;flex-direction:column}"
      + ".jtd-field-row{display:grid;grid-template-columns:minmax(130px,190px) minmax(0,1fr);gap:12px;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18))}"
      + ".jtd-fields-compact .jtd-field-row{grid-template-columns:minmax(120px,180px) minmax(0,1fr);padding:5px 0}"
      + ".jtd-fields-compact .jtd-field-v{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
      + ".jtd-group{margin-top:4px}"
      + ".jtd-group-title{margin:12px 0 2px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary, #999)}"
      + ".jtd-longfields{display:flex;flex-direction:column;gap:2px}"
      + ".jtd-longfield{padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18))}"
      + ".jtd-longfield:last-child{border-bottom:none}"
      + ".jtd-longfield-k{margin:0 0 5px;font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-field-row:last-child{border-bottom:none}"
      + ".jtd-field-k{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary, #666);overflow-wrap:anywhere}"
      + ".jtd-field-v{margin:0;font-size:12.5px;color:var(--dsw-alias-label-primary, #222);overflow-wrap:anywhere}"
      + ".jtd-comments{display:flex;flex-direction:column}"
      + ".jtd-comment{display:flex;gap:10px;padding:13px 0;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18))}"
      + ".jtd-comment:last-child{border-bottom:none}"
      + ".jtd-comment-avatar{width:28px;height:28px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;background:var(--dsw-alias-bg-layer-2, rgba(127,127,127,.14));color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-comment-main{flex:1;min-width:0}"
      + ".jtd-comment-head{display:flex;align-items:baseline;gap:8px;margin-bottom:3px}"
      + ".jtd-comment-author{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary, #222)}"
      + ".jtd-comment-time{font-size:11px;color:var(--dsw-alias-label-secondary, #666)}"
      + ".jtd-changes{display:flex;flex-direction:column}"
      + ".jtd-change{padding:11px 0;border-bottom:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18))}"
      + ".jtd-change:last-child{border-bottom:none}"
      + ".jtd-change-head{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}"
      + ".jtd-title-right{margin-left:auto;display:flex;align-items:center;gap:6px}"
      + "@media (max-width:900px){.jtd-cols{grid-template-columns:minmax(0,1fr)}.jtd-rail{position:static}.jtd-field-row{grid-template-columns:minmax(0,1fr);gap:2px}}"
      + ".jtd-navbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}"
      + ".jtd-titleblock{display:flex;flex-direction:column;gap:7px;min-width:0}"
      + ".jtd-keyline{display:flex;align-items:center;gap:6px;flex-wrap:wrap}"
      + ".jtd-keybig{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;font-weight:600;color:var(--dsw-alias-brand-primary, #2f6fed)}"
      + ".jtd-summary{margin:0;font-size:19px;font-weight:650;line-height:1.35;color:var(--dsw-alias-label-primary, #222);max-width:52ch;overflow-wrap:anywhere}"
      + ".jtd-chip{display:inline-flex;align-items:center;border-radius:20px;padding:1px 9px;font-size:11px;line-height:1.75;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));color:var(--dsw-alias-label-secondary, #666);background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.06));white-space:nowrap}"
      + "@media (max-width:720px){.jtd-page{padding:calc(var(--dsh-frame-top-clearance,0px) + 14px) 14px 28px}}"
      + ".jtd-c-fallback{width:100%;box-sizing:border-box;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.6;padding:6px 8px;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.28));border-radius:8px;background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05));color:var(--dsw-alias-label-primary, #222);resize:vertical}"
      + ".jtd-c-msg{font-size:11.5px;line-height:1.6;color:var(--dsw-alias-label-primary, #222);padding:6px 8px;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.24));border-radius:8px;background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05));word-break:break-word}"
      + ".jtd-c-msg.is-bad{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary, #d93026) 40%, transparent)}"
      + "@media (max-width:900px){.jtd-f-body{grid-template-columns:minmax(0,1fr)}.jtd-c-attstate{max-width:34%}}";

    // 统计页是 root 级 main 面板，不属于某个会话；「上次查看的项目编号」和
    // 会话面板按工作区保存的配置分开存（同一个 origin 的 localStorage）。
    var STATS_PANEL_ID = "jira-stats";
    var STATS_STORAGE_KEY = "dsh.jiraTasks.stats.v1";
    /** 版本列表每页条数（按发布日期倒序取“最近”的版本）。 */
    var VERSION_PAGE_SIZE = 10;

    var STORAGE_KEY = "dsh.jiraTasks.config.v1";

    function defaultJql(key) {
      return 'project = "' + (key || "{projectKey}") + '" AND status in ("开启", "重新开启") AND assignee = currentUser() ORDER BY updated DESC';
    }

    function loadAll() {
      try {
        if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) { return null; }
    }
    function persistAll(all) {
      try {
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch (e) {}
    }
    function isLegacy(all) {
      return all !== null && typeof all === "object" && (typeof all.projectKey === "string" || typeof all.jql === "string");
    }
    function loadConfigFor(wsKey) {
      var all = loadAll();
      if (all === null) return { projectKey: "", jql: "" };
      if (isLegacy(all)) {
        var legacy = { projectKey: String(all.projectKey || ""), jql: String(all.jql || "") };
        if (wsKey) { var mig = {}; mig[wsKey] = legacy; persistAll(mig); return legacy; }
        return { projectKey: "", jql: "" };
      }
      var entry = all[wsKey];
      if (!entry) return { projectKey: "", jql: "" };
      return { projectKey: String(entry.projectKey || ""), jql: String(entry.jql || "") };
    }
    function saveConfigFor(wsKey, config) {
      var all = loadAll();
      if (all === null || isLegacy(all)) all = {};
      all[wsKey] = { projectKey: config.projectKey, jql: config.jql };
      persistAll(all);
    }

    function query(projectKey, jql) {
      return fetch("/jira/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectKey: projectKey, jql: jql })
      }).then(function (r) { return r.json(); });
    }

    // 探测 JIRA 地址/令牌可用性；可选传入未保存的草稿值。
    function testConnection(payload) {
      return fetch("/jira/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      }).then(function (r) { return r.json(); });
    }

    // ---- 任务统计页：数据访问与本地存储 ----
    // 统一 POST JSON：空响应（通常来自尚未重载的旧 Host，未知路由返回 405）和非 JSON
    // 响应给出可操作提示，而不是把 "Unexpected end of JSON input" 直接抛给用户。
    function postJson(path, payload) {
      return fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      }).then(function (response) {
        return response.text().then(function (text) {
          if (!text) {
            throw new Error("接口 " + path + " 返回空响应（HTTP " + response.status
              + "）——Host 可能仍在运行旧版本，请完全退出应用后重新打开（macOS 用 Cmd+Q）");
          }
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error("接口 " + path + " 返回的不是 JSON（HTTP " + response.status + "）");
          }
        });
      });
    }

    function queryStats(projectKey) {
      return postJson("/jira/api/stats", { projectKey: projectKey });
    }

    function queryVersionIssues(projectKey, versionName) {
      return postJson("/jira/api/version-issues", { projectKey: projectKey, versionName: versionName });
    }

    // ---- 工单详情 / 附件下载：三个新 Host 路由 ----
    // 请求体形状见 SPEC §1.1–1.3：
    //   POST /jira/api/issue      { issueKey }
    //   POST /jira/api/attachment { issueKey, attachmentId }   ← 只传 id，绝不传 URL
    //   POST /jira/api/attachments{ issueKey }
    // 统一走 postJson：Host 未升级（路由不存在 → 405 空响应）时给出可操作提示。
    function queryIssueDetail(issueKey) {
      return postJson("/jira/api/issue", { issueKey: issueKey });
    }

    function downloadIssueAttachment(issueKey, attachmentId) {
      return postJson("/jira/api/attachment", { issueKey: issueKey, attachmentId: attachmentId });
    }

    function downloadIssueAttachments(issueKey) {
      return postJson("/jira/api/attachments", { issueKey: issueKey });
    }

    // 附件大小的人类可读格式。
    function formatBytes(bytes) {
      var n = Number(bytes);
      if (!isFinite(n) || n < 0) return "—";
      if (n < 1024) return String(n) + " B";
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
      if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + " MB";
      return (n / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }

    // 详情里的时间用完整日期（含年份），与列表里的短格式区分开。
    function formatFullDateTime(iso) {
      try {
        var date = new Date(iso);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleString([], {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit"
        });
      } catch (e) {
        return "";
      }
    }

    // 自定义字段的值可能是字符串、数字、布尔、对象或数组，统一转成纯文本展示。
    // 注意：这里只产出字符串，真正的转义交给 React（文本子节点自动转义）。
    function customFieldText(value) {
      if (value === null || value === undefined) return "";
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      if (Array.isArray(value)) {
        var parts = [];
        for (var i = 0; i < value.length; i++) {
          var part = customFieldText(value[i]);
          if (part) parts.push(part);
        }
        return parts.join("、");
      }
      if (typeof value === "object") {
        var raw = value.value;
        if (raw !== null && raw !== undefined && (typeof raw === "string" || typeof raw === "number")) return String(raw);
        if (typeof value.name === "string") return value.name;
        if (typeof value.displayName === "string") return value.displayName;
        if (typeof value.key === "string") return value.key;
        try { return JSON.stringify(value); } catch (e) { return ""; }
      }
      return String(value);
    }

    // 标签 / 组件 / 修复版本：契约给的是字符串数组，但容错处理 {name} 形式。
    function nameListText(value) {
      if (!Array.isArray(value)) return [];
      var out = [];
      for (var i = 0; i < value.length; i++) {
        var text = (typeof value[i] === "string") ? value[i] : customFieldText(value[i]);
        if (text) out.push(text);
      }
      return out;
    }

    // “工单不存在”与“加载失败”的区分：
    // 优先认 Host 给出的 code（实现方若提供 code:"notfound" 就用它），否则按错误文案
    // 兜底匹配（JIRA 对不存在的工单返回 404 + “Issue does not exist…”）。
    // 这样无论 Host 端是否加 code 标识，客户端的三种状态都能正确区分。


    // ======================================================================
    // 工单详情（双形态）· 加入对话 · 附件自动下载
    // ======================================================================
    // 设计稿：research/jira-src/DESIGN.md
    // 契约：research/jira-src/spec/SPEC-v1.7.0.md
    //
    // 关键事实（已核对 DSH 源码，不要再改）：
    //   const actx = ctx.sessions.scope(sessionId);
    //   const shell = actx.get("conversation").input.for(actx);
    //   shell.setDraft(text);                // 整体替换草稿
    //   shell.insertFileReferences(refs);   // 批量插入文件引用 chip
    // 拿不到 shell 时走降级路径（可复制文本），不抛错、不阻断。

    /** 插件 client 的 ctx（apply 时捕获），组件里要访问服务时用。 */
    var pluginCtx = null;

    /**
     * 拿到当前会话的输入外壳。拿不到返回 null —— 调用方必须走降级路径。
     * @param {string} sessionId - 目标会话 id。
     * @returns {object|null} 输入外壳。
     */
    function resolveInputShell(sessionId) {
      try {
        if (!pluginCtx || !sessionId) return null;
        var sessions = pluginCtx.get("sessions");
        if (!sessions || typeof sessions.scope !== "function") return null;
        var actx = sessions.scope(sessionId);
        if (!actx || typeof actx.get !== "function") return null;
        var conversation = actx.get("conversation");
        if (!conversation || !conversation.input || typeof conversation.input.for !== "function") return null;
        return conversation.input.for(actx) || null;
      } catch (e) {
        return null;
      }
    }

    /**
     * 把内容写进当前会话的输入框（只填草稿，不发送）。
     * @param {string} sessionId - 目标会话 id。
     * @param {string} text - 写入草稿的文本。
     * @param {Array} fileRefs - 文件引用 chip 描述。
     * @returns {{ok: boolean, reason: string}} 是否写入成功。
     */
    function writeToConversation(sessionId, text, fileRefs) {
      var shell = resolveInputShell(sessionId);
      if (!shell) return { ok: false, reason: "拿不到当前会话的输入框" };
      try {
        var setter = null;
        if (typeof shell.setDraft === "function") setter = function (t) { shell.setDraft(t); };
        else if (shell.actions && typeof shell.actions.setDraft === "function") setter = function (t) { shell.actions.setDraft(t); };
        if (!setter) return { ok: false, reason: "当前会话的输入框不支持写入草稿" };
        setter(text);
        if (fileRefs && fileRefs.length > 0 && typeof shell.insertFileReferences === "function") {
          shell.insertFileReferences(fileRefs);
        }
        return { ok: true, reason: "" };
      } catch (e) {
        return { ok: false, reason: String((e && e.message) || e) };
      }
    }

    /** 把 JIRA 的 wiki markup 粗压成纯文本 —— 智能体读纯文本足够。 */
    function stripMarkup(text) {
      var s = String(text == null ? "" : text);
      return s
        .replace(/<[^>]+>/g, " ")
        .replace(/\{code\}/gi, "\n```\n")
        .replace(/\{code:[^}]*\}/gi, "\n```\n")
        .replace(/\{noformat\}/gi, "\n")
        .replace(/\{color:[^}]*\}/gi, "")
        .replace(/\{[a-zA-Z][^}]*\}/g, "")
        .replace(/^[ \t]*[*#]+\s+/gm, "")
        .replace(/[ \t]+$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    /** JQL 字符串里的双引号要转义。 */
    function escapeJqlText(value) {
      return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }

    /**
     * 查同项目近 30 天的相关工单（同类型或同组件），最多 5 条。
     * @param {string} projectKey - 项目 key。
     * @param {string} currentKey - 当前工单号（排除自己）。
     * @param {object} detail - 工单详情（用于取类型与组件）。
     * @returns {Promise<Array>} 相关工单行。
     */
    function queryRelatedIssues(projectKey, currentKey, detail) {
      var key = String(projectKey || "").trim();
      if (!key) return Promise.resolve([]);
      var clauses = [];
      var type = detail && detail.issueType ? String(detail.issueType) : "";
      if (type) clauses.push('issuetype = "' + escapeJqlText(type) + '"');
      var comps = (detail && detail.components) || [];
      if (comps.length > 0) {
        var parts = [];
        for (var i = 0; i < comps.length; i++) parts.push('"' + escapeJqlText(comps[i]) + '"');
        clauses.push("component in (" + parts.join(", ") + ")");
      }
      var filter = clauses.length > 0 ? " AND (" + clauses.join(" OR ") + ")" : "";
      var jql = 'project = "' + escapeJqlText(key) + '" AND key != "' + escapeJqlText(currentKey) + '"'
        + " AND updated >= -30d" + filter + " ORDER BY updated DESC";
      return postJson("/jira/api/search", { projectKey: key, jql: jql, maxResults: 5 })
        .then(function (res) {
          if (!res || !res.ok || !Array.isArray(res.issues)) return [];
          var out = [];
          for (var k = 0; k < res.issues.length && k < 5; k++) {
            var it = res.issues[k];
            out.push({ key: it.key, summary: it.summary || "", status: it.status || "" });
          }
          return out;
        })
        .catch(function () { return []; });
    }

    /**
     * 组装写进对话的文本。
     * @param {object} detail - 工单详情。
     * @param {string} projectKey - 本工作区的项目 key。
     * @param {Array} related - 相关工单行。
     * @param {Array} savedFiles - 已下载附件 {filename, path}。
     * @returns {string} 文本。
     */
    function buildIssueContextText(detail, projectKey, related, savedFiles) {
      var lines = [];
      var key = detail.key || "";
      lines.push("排查 " + key + "（" + (detail.summary || "无标题") + "）");

      var meta = [];
      if (projectKey) meta.push("项目：" + projectKey);
      if (detail.status) meta.push("状态：" + detail.status);
      if (detail.issueType) meta.push("类型：" + detail.issueType);
      if (detail.priority) meta.push("优先级：" + detail.priority);
      if (detail.assignee) meta.push("经办人：" + detail.assignee);
      if (detail.reporter) meta.push("报告人：" + detail.reporter);
      var comps = (detail.components || []).join("/");
      if (comps) meta.push("组件：" + comps);
      var versions = (detail.fixVersions || []).join("/");
      if (versions) meta.push("修复版本：" + versions);
      if (meta.length > 0) lines.push(meta.join("  "));

      var desc = stripMarkup(detail.description);
      lines.push("描述：" + (desc || "（无描述）"));

      var comments = detail.comments || [];
      if (comments.length > 0) {
        lines.push("最近评论：");
        var shown = comments.slice(-5);
        for (var i = 0; i < shown.length; i++) {
          var c = shown[i];
          lines.push("- " + (c.author || "未知") + " " + formatFullDateTime(c.created) + " " + stripMarkup(c.body).replace(/\n+/g, " "));
        }
      }

      if (savedFiles && savedFiles.length > 0) {
        lines.push("附件（已下载到工作区，路径见下方文件引用）：");
        for (var f = 0; f < savedFiles.length; f++) {
          lines.push("- " + savedFiles[f].filename + " → " + savedFiles[f].path);
        }
      }

      if (related && related.length > 0) {
        lines.push("相关工单（同项目近 30 天，同类型或同组件）：");
        for (var r = 0; r < related.length; r++) {
          lines.push("- " + related[r].key + "  " + related[r].summary + "  [" + (related[r].status || "") + "]");
        }
      }

      return lines.join("\n");
    }

    /** 日志类附件的扩展名（用于「只选日志类」快捷筛选）。 */
    var LOG_LIKE_EXT = [".log", ".log.gz", ".txt", ".har", ".json", ".out", ".trace", ".dump"];
    function looksLikeLog(filename) {
      var name = String(filename || "").toLowerCase();
      for (var i = 0; i < LOG_LIKE_EXT.length; i++) {
        if (name.endsWith(LOG_LIKE_EXT[i])) return true;
      }
      return false;
    }

    /** 单附件大小上限（MB），与 Host 的 maxAttachmentMb 默认值一致。 */
    function maxAttachmentMb() {
      try {
        var snap = pluginCtx && pluginCtx.get("configForms");
        if (snap && typeof snap.get === "function") {
          var scope = snap.get("jira-tasks");
          if (scope && typeof scope.getSnapshot === "function") {
            var v = scope.getSnapshot();
            var mb = v && v.value && v.value.maxAttachmentMb;
            if (typeof mb === "number" && mb > 0) return mb;
          }
        }
      } catch (e) { /* 用默认值 */ }
      return 100;
    }


    /**
     * 「加入对话」面板：勾选附件 → 自动下载 → 写进输入框。
     * 下载并发上限 3；已下载的复用；失败的逐条报错不影响其它。
     */
    function AddToConversationPanel(props) {
      var issueKey = String((props && props.issueKey) || "").trim();
      var detail = props && props.detail;
      var onClose = props && props.onClose;
      var onDone = props && props.onDone;
      var sessionId = props && props.sessionId;
      var projectKey = props && props.projectKey;

      var selState = React.useState({});
      var sel = selState[0], setSel = selState[1];
      var stState = React.useState({});
      var st = stState[0], setSt = stState[1];
      var includeDetailState = React.useState(true);
      var includeDetail = includeDetailState[0], setIncludeDetail = includeDetailState[1];
      var busyState = React.useState(false);
      var busy = busyState[0], setBusy = busyState[1];
      var msgState = React.useState("");
      var msg = msgState[0], setMsg = msgState[1];
      // 拿不到会话输入框时的降级：把文本摊出来给用户复制。
      var fbState = React.useState("");
      var fb = fbState[0], setFb = fbState[1];

      var attachments = (detail && Array.isArray(detail.attachments)) ? detail.attachments : [];
      var maxMb = maxAttachmentMb();

      function toggle(id) {
        var next = {};
        for (var k in sel) next[k] = sel[k];
        if (next[id]) delete next[id]; else next[id] = true;
        setSel(next);
      }
      function setAll(on) {
        var next = {};
        if (on) for (var i = 0; i < attachments.length; i++) next[attachments[i].id] = true;
        setSel(next);
      }
      function selectLogsOnly() {
        var next = {};
        for (var i = 0; i < attachments.length; i++) {
          if (looksLikeLog(attachments[i].filename)) next[attachments[i].id] = true;
        }
        setSel(next);
      }
      function statusOf(att) {
        var s = st[att.id];
        if (s) return s;
        if (att.size && att.size > maxMb * 1048576) return { state: "tooLarge" };
        return { state: "idle" };
      }

      function run() {
        var picked = [];
        for (var i = 0; i < attachments.length; i++) {
          if (sel[attachments[i].id]) picked.push(attachments[i]);
        }
        setBusy(true);
        setMsg("");
        var saved = [];
        var failed = [];
        var queue = picked.slice();
        var active = 0;
        var LIMIT = 3;
        function nextOne() {
          if (queue.length === 0) {
            setBusy(false);
            var refs = [];
            for (var s = 0; s < saved.length; s++) {
              refs.push({
                source: "file",
                ref: saved[s].path,
                offset: 0,
                length: 0,
                label: saved[s].filename,
                appearance: "file",
                clipboardText: saved[s].path
              });
            }
            var related = [];
            var detail = props.detail;
            var doWrite = function () {
              var text = buildIssueContextText(detail, projectKey, related, saved);
              var res = writeToConversation(sessionId, text, refs);
              if (!res.ok) {
                setMsg("写入输入框失败：" + res.reason + "。下面的文本请手动复制到输入框。");
                setFb(text);
                if (onDone) onDone({ ok: false, text: text, saved: saved, failed: failed });
                return;
              }
              setMsg("已加入对话（草稿），附件 " + saved.length + " 个。确认无误后发送即可。");
              if (onDone) onDone({ ok: true, text: text, saved: saved, failed: failed });
            };
            if (includeDetail) {
              queryRelatedIssues(projectKey, issueKey, detail).then(function (rel) {
                related = rel;
                doWrite();
              });
            } else {
              doWrite();
            }
            return;
          }
          var att = queue.shift();
          active += 1;
          setSt(function (prev) {
            var next = {};
            for (var k in prev) next[k] = prev[k];
            next[att.id] = { state: "downloading" };
            return next;
          });
          downloadIssueAttachment(issueKey, att.id).then(function (res) {
            active -= 1;
            if (res && res.ok) {
              saved.push({ filename: res.filename || att.filename, path: res.path, bytes: res.bytes });
              setSt(function (prev) {
                var next = {};
                for (var k in prev) next[k] = prev[k];
                next[att.id] = { state: "done", path: res.path };
                return next;
              });
            } else {
              failed.push({ filename: att.filename, reason: (res && res.error) || "未知错误" });
              setSt(function (prev) {
                var next = {};
                for (var k in prev) next[k] = prev[k];
                next[att.id] = { state: "failed", reason: (res && res.error) || "未知错误" };
                return next;
              });
            }
            nextOne();
          }).catch(function (err) {
            active -= 1;
            failed.push({ filename: att.filename, reason: String((err && err.message) || err) });
            setSt(function (prev) {
              var next = {};
              for (var k in prev) next[k] = prev[k];
              next[att.id] = { state: "failed", reason: String((err && err.message) || err) };
              return next;
            });
            nextOne();
          });
        }
        nextOne();
      }

      var rows = attachments.map(function (att) {
        var s = statusOf(att);
        var tooBig = s.state === "tooLarge";
        var checked = !!sel[att.id];
        return h("label", { className: "jtd-c-attrow" + (tooBig ? " is-disabled" : ""), key: att.id },
          h("input", {
            type: "checkbox",
            checked: checked,
            disabled: tooBig || busy,
            onChange: function () { toggle(att.id); }
          }),
          h("span", { className: "jtd-c-attname", title: att.filename }, att.filename || "(未命名)"),
          h("span", { className: "jtd-c-attsize" }, formatBytes(att.size)),
          h("span", { className: "jtd-c-attstate" + (s.state === "done" ? " is-ok" : (s.state === "failed" ? " is-bad" : "")) },
            s.state === "done" ? "已下载 ✓"
              : s.state === "downloading" ? "下载中…"
                : s.state === "failed" ? ("失败：" + (s.reason || ""))
                  : s.state === "tooLarge" ? ("超过 " + maxMb + " MB 上限")
                    : "未下载")
        );
      });

      var pending = [];
      for (var i = 0; i < attachments.length; i++) {
        if (sel[attachments[i].id] && statusOf(attachments[i]).state !== "done" && statusOf(attachments[i]).state !== "tooLarge") {
          pending.push(attachments[i]);
        }
      }
      var pendingBytes = 0;
      for (var p = 0; p < pending.length; p++) pendingBytes += (pending[p].size || 0);

      return h("div", { className: "jtd-c-addbox" },
        h("div", { className: "jtd-c-addhead" },
          h("span", { className: "jtd-c-addtitle" }, "加入当前对话"),
          h("button", { type: "button", className: "jtd-toggle", onClick: onClose }, "✕")
        ),
        h("label", { className: "jtd-c-check" },
          h("input", {
            type: "checkbox",
            checked: includeDetail,
            disabled: busy,
            onChange: function (e) { setIncludeDetail(e.target.checked); }
          }),
          h("span", null, "工单详情（字段、描述、最近评论、相关工单）")
        ),
        attachments.length > 0
          ? h("div", { className: "jtd-c-atts" },
            h("div", { className: "jtd-c-attoolbar" },
              h("span", { className: "jtd-c-atthint" }, "附件 " + attachments.length + " 个"),
              h("button", { type: "button", className: "jtd-toggle", disabled: busy, onClick: function () { setAll(true); } }, "全选"),
              h("button", { type: "button", className: "jtd-toggle", disabled: busy, onClick: selectLogsOnly }, "只选日志类")
            ),
            h("div", { className: "jtd-c-attlist" }, rows)
          )
          : h("div", { className: "jtd-hint" }, "这个工单没有附件。"),
        pending.length > 0
          ? h("div", { className: "jtd-c-note" },
            "ⓘ " + pending.length + " 个待下载，共 " + formatBytes(pendingBytes) + "。")
          : null,
        msg ? h("div", { className: "jtd-c-msg" + (msg.indexOf("失败") >= 0 ? " is-bad" : "") }, msg) : null,
        fb
          ? h("div", { className: "jtd-sec" },
            h("h4", { className: "jtd-sec-title" }, "请复制下面的内容到输入框"),
            h("textarea", {
              className: "jtd-c-fallback",
              readOnly: true,
              value: fb,
              rows: 10
            }),
            h("button", {
              type: "button",
              className: "jtd-toggle",
              onClick: function () {
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(fb);
                } catch (e) { /* 复制失败就手动选中 */ }
              }
            }, "复制")
          )
          : null,
        h("div", { className: "jtd-c-actions" },
          h("button", { type: "button", className: "jtd-toggle", disabled: busy, onClick: onClose }, "取消"),
          h("button", {
            type: "button",
            className: "jtd-btn-primary",
            disabled: busy || (!includeDetail && pending.length === 0),
            onClick: run
          }, busy ? "处理中…" : "下载并加入对话")
        )
      );
    }


    // ======================================================================
    // 工单详情页（main 中央面板）—— 阅读体验版
    // ======================================================================
    // 形态：main 中央面板（key=jira-issue），与「JIRA 统计」同级。
    //   打开：layout.selectPanel("jira-issue")
    //   返回：layout.selectPanel(null) —— 宿主原生的「回到对话」
    //
    // 阅读体验要点：
    //   1. 两栏：左侧正文，右侧 sticky 元数据栏（状态/经办人/时间/附件）
    //   2. JIRA wiki 标记渲染成 React 元素（不用 dangerouslySetInnerHTML）：
    //      [文字|链接] → 链接、**粗体** → 加粗、h1./h2. → 小标题、* 项 → 列表、
    //      !图片! → 图片链接（**不自动加载远程图片**，避免向第三方发请求）
    //   3. 长描述折叠（超过阈值显示「展开全文」）
    //   4. 评论用时间线（头像圈 + 作者 + 时间 + 正文）
    //   5. 自定义字段用「字段名 → 值」的对照表，不再是稀稀拉拉的网格

    /** 工单详情页在 main 槽位里的 key。固定一个，面板内部切换工单。 */
    var ISSUE_PANEL_ID = "jira-issue";

    /** 当前要打开的工单（main 面板拿不到 sessionId，打开时一起存下来）。 */
    var issueTarget = { issueKey: "", sessionId: "", projectKey: "", baseUrl: "" };

    /** 打开工单详情页（切到 main 中央面板）。 */
    function openIssuePage(target) {
      issueTarget = {
        issueKey: String((target && target.issueKey) || "").trim(),
        sessionId: (target && target.sessionId) || "",
        projectKey: (target && target.projectKey) || "",
        baseUrl: (target && target.baseUrl) || ""
      };
      if (!issueTarget.issueKey) return false;
      var layout = pluginCtx && pluginCtx.get("layout");
      if (!layout || typeof layout.selectPanel !== "function") return false;
      try {
        layout.selectPanel(ISSUE_PANEL_ID);
        return true;
      } catch (e) {
        return false;
      }
    }

    /** 返回对话（宿主原生行为：selectPanel(null) 回到会话）。 */
    function backToConversation() {
      var layout = pluginCtx && pluginCtx.get("layout");
      if (!layout || typeof layout.selectPanel !== "function") return false;
      try {
        layout.selectPanel(null);
        return true;
      } catch (e) {
        return false;
      }
    }

    /**
     * JIRA 字段定义（id → 名称/类型）。
     * 自定义字段的可读名称不在 issue 数据里，要单独查 /rest/api/2/field。
     * 缓存 10 分钟：字段定义很少变，但新建的字段要能在一段时间后出现。
     */
    var fieldDefsCache = null;
    var fieldDefsAt = 0;
    var FIELD_DEFS_TTL = 10 * 60 * 1000;

    /**
     * 工单类型配置屏幕（= JIRA 原生详情页可见的字段）。按工单号缓存。
     * 取不到就返回空数组：客户端会退回"显示全部有值字段"，不报错。
     */
    var screenFieldsCache = {};
    function fetchScreenFields(issueKey) {
      var key = String(issueKey || "").trim();
      if (!key) return Promise.resolve([]);
      if (screenFieldsCache[key]) return Promise.resolve(screenFieldsCache[key]);
      return postJson("/jira/api/issue-screen", { issueKey: key }).then(function (res) {
        var list = (res && res.ok && Array.isArray(res.screenFields)) ? res.screenFields : [];
        screenFieldsCache[key] = list;
        return list;
      }).catch(function () {
        return screenFieldsCache[key] || [];
      });
    }

    /**
     * 取字段定义。失败不抛错，也不缓存失败结果——页面上退回显示原始 id。
     * @returns {Promise<{map: object, order: Array}>} 字段表。
     */
    function fetchFieldDefs() {
      var now = Date.now();
      if (fieldDefsCache && (now - fieldDefsAt) < FIELD_DEFS_TTL) {
        return Promise.resolve(fieldDefsCache);
      }
      return postJson("/jira/api/fields", {}).then(function (res) {
        if (!res || !res.ok || !Array.isArray(res.fields)) return fieldDefsCache || { map: {}, order: [] };
        var map = {};
        var order = [];
        for (var i = 0; i < res.fields.length; i++) {
          var f = res.fields[i];
          if (!f || !f.id) continue;
          map[f.id] = { name: f.name || "", type: f.type || "", custom: !!f.custom, description: f.description || "" };
          order.push(f.id);
        }
        fieldDefsCache = { map: map, order: order };
        fieldDefsAt = Date.now();
        return fieldDefsCache;
      }).catch(function () {
        return fieldDefsCache || { map: {}, order: [] };
      });
    }

    /**
     * 按 JIRA 配置的字段顺序排列自定义字段；定义表里没有的排最后。
     * @param {Array} keys - issue 上实际存在的自定义字段 id。
     * @param {object} defs - 字段定义表。
     * @returns {Array} 排好序的 id。
     */
    function orderCustomFieldKeys(keys, defs) {
      if (!defs || !defs.order || defs.order.length === 0) return keys;
      var pending = {};
      for (var i = 0; i < keys.length; i++) pending[keys[i]] = true;
      var ordered = [];
      for (var j = 0; j < defs.order.length; j++) {
        if (pending[defs.order[j]]) {
          ordered.push(defs.order[j]);
          delete pending[defs.order[j]];
        }
      }
      for (var k = 0; k < keys.length; k++) {
        if (pending[keys[k]]) ordered.push(keys[k]);
      }
      return ordered;
    }

    /**
     * 判断一个值是不是「JIRA 从字段帮助文本预填的模板」而不是人写的。
     * 这个实例大量自定义字段的值就是字段说明本身（例：「请详细说明…」），
     * 显示出来是一堆噪声。
     * @param {string} text - 值的纯文本。
     * @param {string} description - 字段帮助文本。
     * @returns {boolean} 是否是未填写的模板。
     */
    function looksUnfilled(text, description) {
      var t = String(text == null ? "" : text).trim();
      if (!t) return true;
      var d = String(description == null ? "" : description).trim();
      if (d.length >= 8 && t.indexOf(d.slice(0, 40)) === 0) return true;
      if (t.length > 12 && /^(请|填写|默认值|在此处|详细说明|请详细|请说明|说明(?!如下))/.test(t)) return true;
      return false;
    }

    /** 识别插件把 Java 对象 toString 出来的垃圾值（例：开发状态插件的 SummaryBean）。 */
    function looksLikeJavaDump(text) {
      var t = String(text == null ? "" : text).trim();
      if (!t) return false;
      return /@[0-9a-f]{6,}/i.test(t) || /^\{?\w*Bean=com\./i.test(t);
    }

    /**
     * 字段的显示名：优先用 issue 自带的 names，其次字段定义表，最后退回原始 id。
     * @param {string} id - 字段 id。
     * @param {object} defs - 字段定义表。
     * @param {object} issueNames - issue 响应里的 names 映射。
     * @returns {{text: string, resolved: boolean, type: string}} 标签信息。
     */
    function fieldLabelOf(id, defs, issueNames) {
      if (issueNames && issueNames[id]) {
        var d0 = defs && defs.map ? defs.map[id] : null;
        return { text: String(issueNames[id]), resolved: true, type: d0 ? (d0.type || "") : "" };
      }
      return fieldLabelOfBasic(id, defs);
    }

    /** 字段的显示名：查到就用名称，查不到退回原始 id。 */
    function fieldLabelOfBasic(id, defs) {
      var d = defs && defs.map ? defs.map[id] : null;
      if (d && d.name) return { text: d.name, resolved: true, type: d.type || "" };
      return { text: id, resolved: false, type: d ? (d.type || "") : "" };
    }

    /**
     * 按字段类型渲染取值。
     * @param {*} value - 原始值。
     * @param {string} type - 字段 schema.type。
     * @returns {object} React 节点。
     */
    function fieldValueNode(value, type, clamp) {
      if (value === null || value === undefined || value === "") {
        return h("span", { className: "jtd-muted" }, "—");
      }
      if (type === "array" || type === "labels") {
        var arr = Array.isArray(value) ? value : [value];
        var items = [];
        for (var i = 0; i < arr.length; i++) {
          var t = customFieldText(arr[i]);
          if (t) items.push(h("span", { className: "jt-chip", key: i }, t));
        }
        return items.length > 0 ? h("div", { className: "jtd-chips" }, items) : h("span", { className: "jtd-muted" }, "—");
      }
      if (type === "date" || type === "datetime") {
        var raw = (typeof value === "string") ? value : ((value && (value.value || value.name)) || "");
        var shown = formatFullDateTime(raw) || String(raw);
        return h("span", null, shown);
      }
      var text = customFieldText(value);
      if (text === "") return h("span", { className: "jtd-muted" }, "—");
      if (clamp) return h("span", { className: "jtd-clamp" }, text);
      return h("span", null, text);
    }

    /** 只允许 http/https 与站内相对路径，避免 javascript: 之类的注入。 */
    function safeUrl(url) {
      var s = String(url == null ? "" : url).trim();
      if (/^https?:\/\//i.test(s)) return s;
      if (/^\/(?!\/)/.test(s)) return s;
      return null;
    }

    /** 清掉 HTML 标签与 JIRA 宏，保留 wiki 的行结构（列表/标题由渲染层处理）。 */
    function cleanWiki(text) {
      return String(text == null ? "" : text)
        .replace(/<[^>]+>/g, " ")
        .replace(/\{code\}/gi, "```")
        .replace(/\{code:[^}]*\}/gi, "```")
        .replace(/\{noformat\}/gi, "")
        .replace(/\{color:[^}]*\}/gi, "")
        .replace(/\{quote\}/gi, "")
        .replace(/\{[a-zA-Z][^}]*\}/g, "");
    }

    /**
     * 描述里的图片：默认**不加载**远程资源（只显示一个按钮），
     * 用户点击后才把 <img> 挂上去。既给了"点击看图"，又不替用户向第三方发请求。
     */
    function JtdImageChip(props) {
      var url = (props && props.url) || "";
      var openState = React.useState(!!(props && props.defaultOpen));
      var open = openState[0], setOpen = openState[1];
      if (!open) {
        return h("button", {
          type: "button",
          className: "jtd-imglink",
          title: url,
          onClick: function () { setOpen(true); }
        }, "🖼 图片 · 点击显示");
      }
      return h("span", { className: "jtd-imgbox" },
        h("img", { className: "jtd-img", src: url, alt: "工单图片", loading: "lazy" }),
        h("span", { className: "jtd-imgtools" },
          h("button", {
            type: "button",
            className: "jtd-toggle",
            onClick: function () { setOpen(false); }
          }, "收起"),
          h("a", {
            className: "jtd-toggle",
            href: url,
            target: "_blank",
            rel: "noreferrer noopener"
          }, "新标签打开"))
      );
    }

    /**
     * 展开状态更新：按字段 id 翻转。纯函数，方便单测。
     * @param {object} prev - 之前的展开状态 {id: bool}。
     * @param {string} id - 要翻转的字段 id。
     * @returns {object} 新的展开状态。
     */
    function toggleFieldOpen(prev, id) {
      var next = {};
      for (var k in prev) next[k] = prev[k];
      next[id] = !next[id];
      return next;
    }

    /**
     * 叙述性长文字段：超长折叠，可展开。
     * id 通过 prop 传进来（不是闭包捕获循环变量）——之前用 `var cid` + 闭包，
     * 所有字段的按钮都去翻**最后一个**字段，点谁都不展开。
     */
    function JtdNarrativeField(props) {
      var id = props && props.id;
      var name = (props && props.name) || "";
      var text = String((props && props.text) || "");
      var open = !!(props && props.open);
      var onToggle = props && props.onToggle;
      var info = clampText(text, 400);
      return h("div", { className: "jtd-longfield" },
        h("h4", { className: "jtd-longfield-k" }, name),
        h("div", { className: "jtd-prose" }, renderWiki(open ? text : info.text)),
        info.clamped
          ? h("button", {
            type: "button",
            className: "jtd-more",
            onClick: function () { if (onToggle) onToggle(id); }
          }, open ? "收起" : "展开全文（" + text.length + " 字）")
          : null
      );
    }

    /**
     * 描述区块：超长时折叠，可展开。
     * 独立成组件是为了能单独渲染验证（之前它内联在面板里，展开按钮的状态接线
     * 没法被 harness 覆盖）。
     */
    function JtdDescription(props) {
      var text = String((props && props.text) || "");
      var openState = React.useState(!!(props && props.defaultOpen));
      var open = openState[0], setOpen = openState[1];
      if (!text) return null;
      var info = clampText(text, 400);
      return h("section", { className: "jtd-section" },
        h("h3", { className: "jtd-section-title" }, "描述"),
        h("div", { className: "jtd-prose" }, renderWiki(open ? text : info.text)),
        info.clamped
          ? h("button", {
            type: "button",
            className: "jtd-more",
            onClick: function () { setOpen(!open); }
          }, open ? "收起" : "展开全文（" + text.length + " 字）")
          : null
      );
    }

    /**
     * 按行截断长文本：尽量切在换行处，返回是否被截断。
     * @param {string} text - 原文。
     * @param {number} limit - 最多保留多少字符。
     * @returns {{text: string, clamped: boolean}} 截断结果。
     */
    function clampText(text, limit) {
      var t = String(text == null ? "" : text);
      if (t.length <= limit) return { text: t, clamped: false };
      var cut = t.slice(0, limit);
      var nl = cut.lastIndexOf("\n");
      if (nl > limit * 0.4) cut = cut.slice(0, nl);
      return { text: cut, clamped: true };
    }

    /** 行内标记 → React 元素：!图片!、[文字|链接]、**粗体**。 */
    function renderWikiInline(line, keyBase) {
      var nodes = [];
      var re = /!\s*([^!|\s][^!|]*?)(?:\|[^!]*?)?!|\[([^\]|]*)\|([^\]]+)\]|\*\*([^*]+)\*\*/g;
      var last = 0;
      var m;
      var n = 0;
      while ((m = re.exec(line)) !== null) {
        if (m.index > last) nodes.push(line.slice(last, m.index));
        if (m[1] !== undefined) {
          // 图片：不自动加载远程资源，做成可点链接，避免向第三方发请求
          var iu = safeUrl(m[1]);
          nodes.push(iu
            ? h(JtdImageChip, { key: keyBase + "i" + n, url: iu })
            : h("span", { key: keyBase + "i" + n, className: "jtd-muted" }, m[1]));
        } else if (m[2] !== undefined) {
          var lu = safeUrl(m[3]);
          var label = m[2] || m[3];
          nodes.push(lu
            ? h("a", { key: keyBase + "l" + n, className: "jtd-link", href: lu, target: "_blank", rel: "noreferrer noopener" }, label)
            : h("span", { key: keyBase + "l" + n }, label));
        } else {
          nodes.push(h("strong", { key: keyBase + "b" + n }, m[4]));
        }
        last = m.index + m[0].length;
        n += 1;
      }
      if (last < line.length) nodes.push(line.slice(last));
      return nodes;
    }

    /** 把整段 JIRA 文本渲染成块级 React 元素（段落/小标题/列表）。 */
    function renderWiki(text) {
      var lines = cleanWiki(text).split(/\r?\n/);
      var blocks = [];
      var list = null;
      function flush() {
        if (list) { blocks.push(h("ul", { key: "ul" + blocks.length, className: "jtd-bullets" }, list)); list = null; }
      }
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/\s+$/, "");
        if (!line.trim()) { flush(); continue; }
        var hm = /^(h[1-6])\.\s*(.*)$/i.exec(line.trim());
        if (hm) {
          flush();
          blocks.push(h("h5", { key: "h" + i, className: "jtd-wiki-h" }, renderWikiInline(hm[2], "h" + i)));
          continue;
        }
        var lm = /^\s*[*\-]\s+(.*)$/.exec(line);
        if (lm) {
          if (!list) list = [];
          list.push(h("li", { key: "li" + i }, renderWikiInline(lm[1], "li" + i)));
          continue;
        }
        flush();
        blocks.push(h("p", { key: "p" + i, className: "jtd-wiki-p" }, renderWikiInline(line.trim(), "p" + i)));
      }
      flush();
      return blocks;
    }

    /**
     * 工单详情页（注册在 main 槽位）。页面外壳照抄「JIRA 统计」那套已验证结构
     * （jtst-page / jtst-inner / jtst-head），不自己发明一套。
     */
    function JiraIssuePage() {
      var t = issueTarget;
      var openInJira = t.baseUrl && t.issueKey
        ? t.baseUrl.replace(/\/+$/, "") + "/browse/" + encodeURIComponent(t.issueKey)
        : "";
      return h("div", { className: "jtd-page" },
        h("div", { className: "jtd-inner" },
          h("div", { className: "jtd-navbar" },
            h("button", {
              type: "button",
              className: "jtd-back",
              title: "回到对话",
              onClick: backToConversation
            }, "← 返回"),
            h("div", { className: "jtd-pactions" },
              openInJira
                ? h("a", {
                  className: "jtd-toggle",
                  href: openInJira,
                  target: "_blank",
                  rel: "noreferrer"
                }, "在 JIRA 打开")
                : null)
          ),
          h(IssueDetailPanel, {
            issueKey: t.issueKey,
            sessionId: t.sessionId,
            projectKey: t.projectKey,
            baseUrl: t.baseUrl
          })
        )
      );
    }

    /** 概要里的一格「键：值」。空值返回 null（不占位）。 */
    function detailKv(k, v) {
      var text = v === null || v === undefined ? "" : String(v);
      if (text === "") return null;
      return h("div", { className: "jtd-kv" },
        h("div", { className: "jtd-kv-k" }, k),
        h("div", { className: "jtd-kv-v" }, text)
      );
    }

    /**
     * 工单详情内容。
     *   标题区  工单号 + 状态 chip + 摘要大标题 + 「加入对话」
     *   页签条  概览 / 评论 / 附件 / 历史（吸顶）
     *   两栏    左正文，右 sticky 元数据栏
     */
    function IssueDetailPanel(props) {
      var issueKey = String((props && props.issueKey) || "").trim();
      var sessionId = props && props.sessionId;
      var projectKey = props && props.projectKey;

      var stState = React.useState({ phase: "loading", data: null, error: "" });
      var st = stState[0], setSt = stState[1];
      var aliveRef = React.useRef(true);
      React.useEffect(function () {
        aliveRef.current = true;
        return function () { aliveRef.current = false; };
      }, []);

      var tabState = React.useState("overview");
      var tab = tabState[0], setTab = tabState[1];
      var addState = React.useState(false);
      var showAdd = addState[0], setShowAdd = addState[1];
      var dlState = React.useState({});
      var dl = dlState[0], setDl = dlState[1];
      var noteState = React.useState("");
      var note = noteState[0], setNote = noteState[1];
      var busyState = React.useState(false);
      var busy = busyState[0], setBusy = busyState[1];
      // 自定义字段的可读名称（customfield_XXXXX → 中文名）
      var fdState = React.useState(null);
      var fieldDefs = fdState[0], setFieldDefs = fdState[1];
      // 自定义字段区：默认只显示真正填了内容的；逐字段可展开长文本
      var allFieldsState = React.useState(false);
      var showAllFields = allFieldsState[0], setShowAllFields = allFieldsState[1];
      // 「只显示 JIRA 页面上的字段」——默认**关**：实测 editmeta 只覆盖本工单
      // 69 个有值字段里的 17 个（DC 的 View Screen 在 REST 里根本没有端点暴露），
      // 硬过滤会把 52 个有真内容的字段藏掉。所以它只当**排序提示**：屏内字段排前面。
      var onlyScreenState = React.useState(false);
      var onlyScreen = onlyScreenState[0], setOnlyScreen = onlyScreenState[1];
      // 该工单类型配置屏幕上的字段（JIRA 原生详情页可见的那些）
      var screenState = React.useState([]);
      var screenList = screenState[0], setScreenList = screenState[1];
      var openFieldsState = React.useState({});
      var openFields = openFieldsState[0], setOpenFields = openFieldsState[1];

      React.useEffect(function () {
        if (!issueKey) return;
        setSt({ phase: "loading", data: null, error: "" });
        queryIssueDetail(issueKey).then(function (res) {
          if (!aliveRef.current) return;
          if (res && res.ok) setSt({ phase: "ready", data: res, error: "" });
          else setSt({ phase: "error", data: null, error: (res && res.error) || "无法加载工单详情" });
        }).catch(function (err) {
          if (!aliveRef.current) return;
          setSt({ phase: "error", data: null, error: String((err && err.message) || err) });
        });
      }, [issueKey]);

      var d = st.data;
      var attachments = (d && Array.isArray(d.attachments)) ? d.attachments : [];
      var comments = (d && Array.isArray(d.comments)) ? d.comments : [];
      var customFields = (d && d.customFields) ? d.customFields : {};
      var customKeys = Object.keys(customFields);
      var history = (d && Array.isArray(d.changelog)) ? d.changelog : [];
      var descText = d && d.description ? cleanWiki(d.description) : "";

      // 拉一次该工单类型的屏幕字段清单（与原生详情页对齐信息密度）
      React.useEffect(function () {
        if (!issueKey) return;
        var alive = true;
        fetchScreenFields(issueKey).then(function (list) { if (alive) setScreenList(list); });
        return function () { alive = false; };
      }, [issueKey]);

      // 有自定义字段就拉一次字段定义表（带缓存），把 id 换成可读名称
      React.useEffect(function () {
        if (!d) return;
        var ids = d.customFields ? Object.keys(d.customFields) : [];
        if (ids.length === 0) return;
        var alive = true;
        fetchFieldDefs().then(function (defs) { if (alive) setFieldDefs(defs); });
        return function () { alive = false; };
      }, [d]);

      function downloadOne(att) {
        if (dl[att.id] && dl[att.id].state === "downloading") return;
        var next = {};
        for (var k in dl) next[k] = dl[k];
        next[att.id] = { state: "downloading" };
        setDl(next);
        downloadIssueAttachment(issueKey, att.id).then(function (res) {
          if (!aliveRef.current) return;
          var n2 = {};
          for (var k2 in dl) n2[k2] = dl[k2];
          if (res && res.ok) {
            n2[att.id] = { state: "done", path: res.path, bytes: res.bytes };
            setNote("已保存：" + res.path);
          } else {
            n2[att.id] = { state: "failed", reason: (res && res.error) || "未知错误" };
          }
          setDl(n2);
        }).catch(function (err) {
          if (!aliveRef.current) return;
          var n3 = {};
          for (var k3 in dl) n3[k3] = dl[k3];
          n3[att.id] = { state: "failed", reason: String((err && err.message) || err) };
          setDl(n3);
        });
      }

      function downloadAll() {
        setBusy(true);
        setNote("");
        downloadIssueAttachments(issueKey).then(function (res) {
          if (!aliveRef.current) return;
          setBusy(false);
          if (!res || !res.ok) { setNote("批量下载失败：" + ((res && res.error) || "未知错误")); return; }
          var n = {};
          for (var k in dl) n[k] = dl[k];
          var saved = res.saved || [];
          for (var i = 0; i < saved.length; i++) {
            n[saved[i].attachmentId] = { state: "done", path: saved[i].path, bytes: saved[i].bytes };
          }
          setDl(n);
          var failed = res.failed || [];
          setNote("已保存 " + saved.length + " 个到 " + res.dir
            + (failed.length > 0 ? "；失败 " + failed.length + " 个：" + failed.map(function (f) { return f.filename + "(" + f.reason + ")"; }).join("、") : ""));
        }).catch(function (err) {
          if (!aliveRef.current) return;
          setBusy(false);
          setNote("批量下载失败：" + String((err && err.message) || err));
        });
      }

      function attState(att) {
        var s = dl[att.id];
        if (s) return s;
        return { state: "idle" };
      }

      // ---- 附件宽表格（附件页签用）----
      function attachmentTable() {
        if (attachments.length === 0) return h("div", { className: "jtd-hint" }, "这个工单没有附件。");
        var rows = attachments.map(function (att) {
          var s = attState(att);
          return h("tr", { key: att.id },
            h("td", null, h("span", { className: "jtd-file", title: att.filename }, att.filename || "(未命名)")),
            h("td", { className: "jtd-num" }, formatBytes(att.size)),
            h("td", null, att.contentType || "—"),
            h("td", null, att.author || "—"),
            h("td", null, formatFullDateTime(att.created) || "—"),
            h("td", null, s.state === "done"
              ? h("span", { className: "jtd-c-ok", title: s.path }, "已下载 ✓")
              : h("button", {
                type: "button",
                className: "jtd-toggle",
                disabled: s.state === "downloading",
                onClick: function () { downloadOne(att); }
              }, s.state === "downloading" ? "下载中…" : (s.state === "failed" ? "重试" : "下载")))
          );
        });
        return h("div", { className: "jtd-tablewrap" },
          h("table", { className: "jtd-table" },
            h("thead", null, h("tr", null,
              h("th", null, "文件名"),
              h("th", { className: "jtd-num" }, "大小"),
              h("th", null, "类型"),
              h("th", null, "上传者"),
              h("th", null, "时间"),
              h("th", null, "")
            )),
            h("tbody", null, rows)
          )
        );
      }

      // ---- 右侧栏附件紧凑列表 ----
      function attachmentRail() {
        if (attachments.length === 0) return null;
        return h("div", { className: "jtd-card" },
          h("h4", { className: "jtd-card-title" }, "附件 · " + attachments.length),
          h("div", { className: "jtd-attlist" }, attachments.map(function (att) {
            var s = attState(att);
            return h("div", { className: "jtd-att-item", key: att.id },
              h("span", { className: "jtd-att-name", title: att.filename }, att.filename || "(未命名)"),
              h("span", { className: "jtd-att-size" }, formatBytes(att.size)),
              h("span", { className: "jtd-att-foot" },
                s.state === "done"
                  ? h("span", { className: "jtd-c-ok", title: s.path }, "已下载 ✓")
                  : h("button", {
                    type: "button",
                    className: "jtd-toggle",
                    disabled: s.state === "downloading",
                    onClick: function () { downloadOne(att); }
                  }, s.state === "downloading" ? "下载中…" : (s.state === "failed" ? "重试" : "下载"))
              )
            );
          })),
          h("button", {
            type: "button",
            className: "jtd-toggle",
            disabled: busy,
            onClick: downloadAll
          }, busy ? "下载中…" : "全部下载到工作区")
        );
      }

      // ---- 右侧元数据栏 ----
      function metadataRail() {
        var rows = [];
        var items = [
          ["状态", d && d.status], ["类型", d && d.issueType], ["优先级", d && d.priority],
          ["经办人", d && d.assignee], ["报告人", d && d.reporter],
          ["组件", (d && d.components || []).join("、")],
          ["修复版本", (d && d.fixVersions || []).join("、")],
          ["创建", formatFullDateTime((d && d.created) || "")],
          ["更新", formatFullDateTime((d && d.updated) || "")]
        ];
        for (var i = 0; i < items.length; i++) {
          var v = items[i][1];
          if (v === null || v === undefined || v === "") continue;
          rows.push(h("div", { className: "jtd-meta-row", key: "m" + i },
            h("span", { className: "jtd-meta-k" }, items[i][0]),
            h("span", { className: "jtd-meta-v" }, String(v))
          ));
        }
        return h("div", { className: "jtd-card" },
          h("h4", { className: "jtd-card-title" }, "元数据"),
          rows.length > 0 ? h("div", { className: "jtd-metadata" }, rows) : h("div", { className: "jtd-muted" }, "—")
        );
      }

      // ---- 自定义字段：分「叙述性长文」与「结构化短值」两组 ----
      // 三类要过滤掉：空值、JIRA 预填的模板、插件 dump 出来的 Java 对象
      // 长文（技术根因、最小复现条件、修改方案…）单独成段按正文排版，短值走紧凑对照表
      var customFieldRows = [];
      var narrativeBlocks = [];
      var filledCount = 0;
      var templateCount = 0;
      var screenSet = {};
      for (var si = 0; si < screenList.length; si++) screenSet[screenList[si]] = true;
      var screenCount = 0;
      if (customKeys.length > 0) {
        var issueNames = (d && d.fieldNames) || null;
        var orderedKeys = orderCustomFieldKeys(customKeys, fieldDefs);
        var visibleKeys = orderedKeys;
        if (screenList.length > 0) {
          // 先放屏内字段（原生详情页最显眼的那批），再接屏外的
          var head = [];
          var tail = [];
          for (var sk = 0; sk < orderedKeys.length; sk++) {
            if (screenSet[orderedKeys[sk]]) { head.push(orderedKeys[sk]); screenCount += 1; }
            else tail.push(orderedKeys[sk]);
          }
          visibleKeys = onlyScreen ? head : head.concat(tail);
        }
        for (var ck = 0; ck < visibleKeys.length; ck++) {
          var cid = orderedKeys[ck];
          var label = fieldLabelOf(cid, fieldDefs, issueNames);
          var raw = customFields[cid];
          var text = customFieldText(raw);
          if (text === "" && !Array.isArray(raw)) continue;                 // 空字段不占行
          if (looksLikeJavaDump(text)) continue;                            // Java dump 是噪声
          var desc = (fieldDefs && fieldDefs.map && fieldDefs.map[cid]) ? (fieldDefs.map[cid].description || "") : "";
          var isTemplate = looksUnfilled(text, desc);
          if (isTemplate) {
            templateCount += 1;
            if (!showAllFields) continue;                                    // 默认不显示模板
          } else {
            filledCount += 1;
          }
          var fieldIsLong = text.length > 80;
          var open = !!openFields[cid];
          if (fieldIsLong && !isTemplate) {
            // 叙述性长文：单独成段，按正文排版（wiki 标记渲染成元素）
            narrativeBlocks.push(h(JtdNarrativeField, {
              key: cid,
              id: cid,
              name: label.resolved ? label.text : cid,
              text: text,
              open: open,
              onToggle: function (fid) {
                setOpenFields(function (prev) { return toggleFieldOpen(prev, fid); });
              }
            }));
          } else {
            customFieldRows.push(h("div", { className: "jtd-field-row" + (isTemplate ? " is-template" : ""), key: cid },
              h("dt", { className: "jtd-field-k" + (label.resolved ? "" : " is-unresolved"), title: cid },
                label.resolved ? label.text : cid,
                isTemplate ? h("span", { className: "jtd-tag" }, "未填写") : null),
              h("dd", { className: "jtd-field-v", title: text },
                fieldValueNode(raw, label.type, false))
            ));
          }
        }
      }

      // ---- 左侧主内容 ----
      var mainContent;
      if (st.phase === "loading") {
        mainContent = h("div", { className: "jtd-loading" }, "正在加载工单详情…");
      } else if (st.phase === "error") {
        mainContent = h("div", { className: "jt-error" }, "加载失败：" + st.error);
      } else if (showAdd && d) {
        mainContent = h(AddToConversationPanel, {
          issueKey: issueKey,
          detail: d,
          sessionId: sessionId,
          projectKey: projectKey,
          onClose: function () { setShowAdd(false); },
          onDone: function () { /* 结果已显示在面板里 */ }
        });
      } else if (tab === "comments") {
        mainContent = h("div", { className: "jtd-comments" },
          comments.length === 0
            ? h("div", { className: "jtd-hint" }, "没有评论。")
            : comments.map(function (c, i) {
              var who = c.author || "未知";
              return h("div", { className: "jtd-comment", key: c.id || ("c" + i) },
                h("div", { className: "jtd-comment-avatar" }, who.slice(0, 1)),
                h("div", { className: "jtd-comment-main" },
                  h("div", { className: "jtd-comment-head" },
                    h("span", { className: "jtd-comment-author" }, who),
                    h("span", { className: "jtd-comment-time" }, formatFullDateTime(c.created))
                  ),
                  // 评论正文来自 JIRA（外部不可信内容），只作纯文本渲染
                  h("div", { className: "jtd-text" }, c.body || "")
                )
              );
            })
        );
      } else if (tab === "attachments") {
        mainContent = attachmentTable();
      } else if (tab === "history") {
        mainContent = h("div", { className: "jtd-changes" },
          history.length === 0
            ? h("div", { className: "jtd-hint" }, "没有变更记录。")
            : history.map(function (hh, i) {
              return h("div", { className: "jtd-change", key: hh.id || ("h" + i) },
                h("div", { className: "jtd-change-head" },
                  h("span", { className: "jtd-comment-author" }, hh.author || "未知"),
                  h("span", { className: "jtd-comment-time" }, formatFullDateTime(hh.created))
                ),
                h("ul", { className: "jtd-bullets" }, (hh.items || []).map(function (it, k) {
                  return h("li", { key: k },
                    it.field + "：" + (it.from || "—") + " → " + (it.to || "—"));
                }))
              );
            })
        );
      } else {
        var chips = []
          .concat(((d && d.labels) || []).map(function (t) { return { t: t, k: "l" }; }))
          .concat(((d && d.components) || []).map(function (t) { return { t: t, k: "c" }; }))
          .concat(((d && d.fixVersions) || []).map(function (t) { return { t: t, k: "v" }; }));
        mainContent = h("div", { className: "jtd-maincol" },
          descText ? h(JtdDescription, { text: descText }) : null,
          chips.length > 0 ? h("section", { className: "jtd-section" },
            h("h3", { className: "jtd-section-title" }, "标签 / 组件 / 修复版本"),
            h("div", { className: "jtd-chips" }, chips.map(function (c, i) {
              return h("span", { className: "jt-chip", key: c.k + i }, c.t);
            }))
          ) : null,
          customKeys.length > 0 ? h("section", { className: "jtd-section" },
            h("div", { className: "jtd-section-head" },
              h("h3", { className: "jtd-section-title" }, "自定义字段"),
              h("span", { className: "jtd-section-meta" },
                "已填 " + filledCount + " / 共 " + customKeys.length),
              screenList.length > 0
                ? h("button", {
                  type: "button",
                  className: "jtd-toggle",
                  title: "JIRA 原生详情页只显示配置屏幕上的字段，但 REST 取不到那个屏幕（这里用编辑屏近似）",
                  onClick: function () { setOnlyScreen(!onlyScreen); }
                }, onlyScreen
                  ? "显示全部 " + filledCount + " 个已填字段"
                  : "只看 JIRA 页面上的 " + screenCount + " 个")
                : null,
              templateCount > 0
                ? h("button", {
                  type: "button",
                  className: "jtd-toggle",
                  onClick: function () { setShowAllFields(!showAllFields); }
                }, showAllFields ? "只看已填写" : "显示未填写的 " + templateCount + " 项")
                : null
            ),
            narrativeBlocks.length > 0
              ? h("div", { className: "jtd-longfields" },
                h("h4", { className: "jtd-group-title" }, "叙述内容 · " + narrativeBlocks.length + " 项"),
                narrativeBlocks)
              : null,
            customFieldRows.length > 0
              ? h("div", { className: "jtd-group" },
                h("h4", { className: "jtd-group-title" }, "结构化字段 · " + customFieldRows.length + " 项"),
                h("dl", { className: "jtd-fields jtd-fields-compact" }, customFieldRows))
              : null,
            customFieldRows.length === 0 && narrativeBlocks.length === 0
              ? h("div", { className: "jtd-muted" }, "这个工单的自定义字段还都是模板占位，没有实际填写内容。")
              : null
          ) : null
        );
      }

      // ---- 标题区 ----
      var chips = [];
      if (d && d.status) chips.push(h("span", { className: "jtd-chip", key: "s" }, d.status));
      if (d && d.issueType) chips.push(h("span", { className: "jtd-chip", key: "t" }, d.issueType));
      if (d && d.priority) chips.push(h("span", { className: "jtd-chip", key: "p" }, d.priority));

      var tabBtn = function (id, label, count) {
        return h("button", {
          type: "button",
          className: "jtd-tab" + (tab === id ? " is-active" : ""),
          onClick: function () { setTab(id); }
        }, label + (count === null ? "" : " " + count));
      };

      return h("div", { className: "jtd-root jtd-root-page" },
        h("div", { className: "jtd-titleblock" },
          h("div", { className: "jtd-keyline" },
            h("span", { className: "jtd-keybig" }, issueKey),
            chips,
            h("div", { className: "jtd-title-right" },
              h("button", {
                type: "button",
                className: "jtd-btn-primary",
                disabled: !d,
                title: "把工单上下文与选中的附件加入当前对话的输入框（不自动发送）",
                onClick: function () { setShowAdd(!showAdd); }
              }, showAdd ? "取消" : "加入对话 ▾"))
          ),
          h("h1", { className: "jtd-summary" }, (d && d.summary) || "工单详情")
        ),
        h("div", { className: "jtd-tabs" },
          tabBtn("overview", "概览", null),
          tabBtn("comments", "评论", comments.length),
          tabBtn("attachments", "附件", attachments.length),
          tabBtn("history", "历史", history.length)
        ),
        h("div", { className: "jtd-cols" },
          h("div", { className: "jtd-maincol" }, mainContent),
          h("div", { className: "jtd-rail" },
            metadataRail(),
            attachmentRail(),
            note ? h("div", { className: "jtd-c-msg" }, note) : null
          )
        )
      );
    }

    function isNotFoundResponse(res, message) {
      if (res) {
        if (res.code === "notfound" || res.code === "not_found" || res.code === "missing") return true;
        if (res.status === 404 || res.httpStatus === 404) return true;
      }
      var text = String(message || "").toLowerCase();
      if (!text) return false;
      return text.indexOf("不存在") !== -1
        || text.indexOf("not found") !== -1
        || text.indexOf("does not exist") !== -1
        || text.indexOf("404") !== -1;
    }

    function readStatsProjectKey() {
      try {
        if (typeof window === "undefined" || !window.localStorage) return "";
        var raw = window.localStorage.getItem(STATS_STORAGE_KEY);
        if (!raw) return "";
        var parsed = JSON.parse(raw);
        return parsed && typeof parsed.projectKey === "string" ? parsed.projectKey : "";
      } catch (e) {
        return "";
      }
    }

    function writeStatsProjectKey(projectKey) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify({ projectKey: projectKey }));
        }
      } catch (e) { /* 存储失败不影响统计 */ }
    }

    // 第一次打开统计页时，默认沿用会话面板里已配置的项目编号（按工作区的第一条），
    // 这样“已有项目编号”不依赖用户重新输入。
    function firstWorkspaceProjectKey() {
      var all = loadAll();
      if (!all || typeof all !== "object" || isLegacy(all)) return "";
      for (var key in all) {
        if (!Object.prototype.hasOwnProperty.call(all, key)) continue;
        var entry = all[key];
        if (entry && typeof entry.projectKey === "string" && entry.projectKey.trim()) return entry.projectKey.trim();
      }
      return "";
    }

    // 工作区在下拉里的提示文案：配置里只存了工作区路径，取路径末段即可。
    function workspaceLabel(wsKey) {
      var text = String(wsKey || "").trim();
      if (!text) return "已配置";
      var parts = text.split(/[\\/]+/).filter(function (part) { return part; });
      return parts.length > 0 ? parts[parts.length - 1] : text;
    }

    // 下拉选项 = DSH 里已配置的项目 Key（各工作区在会话面板 ⚙ 中保存的 projectKey）
    // + 统计页最近查看的 Key。不是 JIRA 的全部项目列表。
    function configuredProjectOptions() {
      var options = [];
      var seen = {};
      function push(projectKey, hint) {
        var key = String(projectKey || "").trim().toUpperCase();
        if (!key || seen[key]) return;
        seen[key] = true;
        options.push({ key: key, hint: hint || "" });
      }
      push(readStatsProjectKey(), "最近查看");
      var all = loadAll();
      if (all && typeof all === "object") {
        if (isLegacy(all)) {
          push(all.projectKey, "已配置");
        } else {
          for (var wsKey in all) {
            if (!Object.prototype.hasOwnProperty.call(all, wsKey)) continue;
            var entry = all[wsKey];
            if (entry && typeof entry.projectKey === "string") push(entry.projectKey, workspaceLabel(wsKey));
          }
        }
      }
      return options;
    }

    function roundPercent(part, whole) {
      if (!whole) return 0;
      return Math.round((part / whole) * 1000) / 10;
    }

    function formatShare(part, whole) {
      if (!whole) return "0%";
      return String(Math.round((part / whole) * 1000) / 10) + "%";
    }

    function formatClock(iso) {
      try {
        var date = new Date(iso);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      } catch (e) {
        return "";
      }
    }

    // 统计结果的会话内缓存：重新进入统计页或切回看过的项目时，先渲染上次结果，
    // 再在后台静默刷新，避免整页 loading 闪烁。按项目 Key 存，最多保留几个。
    var STATS_CACHE_LIMIT = 6;
    var statsCache = {};
    var statsCacheOrder = [];

    function readStatsCache(projectKey) {
      return Object.prototype.hasOwnProperty.call(statsCache, projectKey) ? statsCache[projectKey] : null;
    }

    function writeStatsCache(projectKey, data) {
      statsCache[projectKey] = data;
      var index = statsCacheOrder.indexOf(projectKey);
      if (index !== -1) statsCacheOrder.splice(index, 1);
      statsCacheOrder.push(projectKey);
      while (statsCacheOrder.length > STATS_CACHE_LIMIT) {
        delete statsCache[statsCacheOrder.shift()];
      }
    }

    // 版本行的状态徽章：未发布 / 已发布 / 仅任务 / 已归档。
    function versionBadge(version) {
      if (version && version.extra) return { chip: "仅任务", chipClass: "jtst-chip jtst-chip-extra" };
      if (version && version.archived) return { chip: "已归档", chipClass: "jtst-chip jtst-chip-archived" };
      if (version && version.released) return { chip: "已发布", chipClass: "jtst-chip jtst-chip-released" };
      return { chip: "未发布", chipClass: "jtst-chip jtst-chip-unreleased" };
    }

    // 版本排序：按发布日期倒序（“最近”的排前面），无日期/仅任务版本排最后，再按名称。
    function compareVersionsByRecency(a, b) {
      var dateA = a && a.releaseDate ? String(a.releaseDate) : "";
      var dateB = b && b.releaseDate ? String(b.releaseDate) : "";
      if (dateA !== dateB) {
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA < dateB ? 1 : -1;
      }
      return String((a && a.name) || "").localeCompare(String((b && b.name) || ""));
    }

    // ---- 版本任务列表：排序与格式化 ----
    // 兼容英文默认优先级、常见别名与中文工作流；未知值排最后。
    var PRIORITY_RANK = {
      highest: 0, blocker: 0, "最高": 0, "紧急": 0,
      high: 1, critical: 1, "高": 1,
      medium: 2, normal: 2, "中": 2, "普通": 2,
      low: 3, "低": 3,
      lowest: 4, trivial: 4, "最低": 4
    };
    var STATUS_CATEGORY_RANK = { new: 0, indeterminate: 1, done: 2 };

    function priorityRank(name) {
      var key = String(name || "").toLowerCase();
      return Object.prototype.hasOwnProperty.call(PRIORITY_RANK, key) ? PRIORITY_RANK[key] : 5;
    }

    function statusCategoryRank(category) {
      return Object.prototype.hasOwnProperty.call(STATUS_CATEGORY_RANK, category) ? STATUS_CATEGORY_RANK[category] : 3;
    }

    /** 当前登录用户（宿主返回 me.name = JIRA 账号名）名下的任务。 */
    function isMyIssue(issue, me) {
      return !!(me && me.name && issue && issue.assigneeKey && issue.assigneeKey === me.name);
    }

    // 「HCPFYH1-9」应排在「HCPFYH1-10」前：同前缀时按数字比较，否则按字符串。
    function compareIssueKeys(aKey, bKey) {
      var left = String(aKey || "");
      var right = String(bKey || "");
      var matchLeft = /^(.*?)(\d+)$/.exec(left);
      var matchRight = /^(.*?)(\d+)$/.exec(right);
      if (matchLeft && matchRight && matchLeft[1] === matchRight[1]) {
        return parseInt(matchLeft[2], 10) - parseInt(matchRight[2], 10);
      }
      return left.localeCompare(right);
    }

    function compareIssueValues(a, b, field, dir) {
      var result = 0;
      if (field === "priority") {
        result = priorityRank(a.priority) - priorityRank(b.priority);
      } else if (field === "status") {
        result = statusCategoryRank(a.statusCategory) - statusCategoryRank(b.statusCategory);
        if (result === 0) result = String(a.status || "").localeCompare(String(b.status || ""));
      } else if (field === "updated") {
        var updatedA = String(a.updated || "");
        var updatedB = String(b.updated || "");
        result = updatedA === updatedB ? 0 : (updatedA < updatedB ? -1 : 1);
      } else {
        var valueA = field === "issueType" ? a.issueType
          : (field === "assignee" ? a.assignee : (field === "summary" ? a.summary : a.key));
        var valueB = field === "issueType" ? b.issueType
          : (field === "assignee" ? b.assignee : (field === "summary" ? b.summary : b.key));
        result = field === "key"
          ? compareIssueKeys(a.key, b.key)
          : String(valueA || "").localeCompare(String(valueB || ""));
      }
      // 同值时用编号兜底，保证排序结果稳定（两次点击不会互相换位）。
      if (result === 0 && field !== "key") result = compareIssueKeys(a.key, b.key);
      return dir === "desc" ? -result : result;
    }

    // 默认排序：本人任务在最前，其余按更新时间倒序。
    function compareIssuesDefault(a, b, me) {
      var mineA = isMyIssue(a, me);
      var mineB = isMyIssue(b, me);
      if (mineA !== mineB) return mineA ? -1 : 1;
      var updatedA = String(a.updated || "");
      var updatedB = String(b.updated || "");
      if (updatedA !== updatedB) return updatedA < updatedB ? 1 : -1;
      return compareIssueKeys(a.key, b.key);
    }

    function formatDateTime(iso) {
      try {
        var date = new Date(iso);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        return "";
      }
    }

    // 转圈：用 SVG 圆环而不是 CSS border 环——小尺寸下边框环会显得方/发虚，
    // SVG 的圆一定是圆的，颜色跟随 currentColor。
    function spinnerIcon(size) {
      var edge = typeof size === "number" ? size : 14;
      return h("svg", {
        className: "jtst-spin-svg",
        width: edge, height: edge, viewBox: "0 0 16 16", fill: "none",
        "aria-hidden": true
      },
        h("circle", { cx: 8, cy: 8, r: 6, stroke: "currentColor", strokeWidth: 2, opacity: 0.22 }),
        h("path", { d: "M8 2a6 6 0 0 1 6 6", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" })
      );
    }

    // 左侧栏图标：柱状图（原始线条，颜色跟随 currentColor，选中态加深填充）。
    function JiraStatsIcon(props) {
      var size = props && typeof props.size === "number" ? props.size : 16;
      var active = !!(props && props.active);
      return h("svg", {
        width: size, height: size, viewBox: "0 0 16 16", fill: "none",
        "aria-hidden": true, style: { display: "block" }
      },
        h("path", { d: "M2.6 13.4h10.8", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", opacity: 0.55 }),
        h("rect", { x: "3.2", y: "8.4", width: "2.4", height: "4.2", rx: ".7", fill: "currentColor", fillOpacity: active ? 0.55 : 0.4 }),
        h("rect", { x: "6.8", y: "5.4", width: "2.4", height: "7.2", rx: ".7", fill: "currentColor", fillOpacity: active ? 0.8 : 0.65 }),
        h("rect", { x: "10.4", y: "2.6", width: "2.4", height: "10", rx: ".7", fill: "currentColor", fillOpacity: active ? 1 : 0.85 })
      );
    }

    // ---- 任务统计页组件（root 级 main 面板）----
    // 数据全部来自 Host（/jira/api/stats 已聚合好），这里只负责取数、切换项目、渲染。
    function JiraStatsPanel() {
      // 下拉选项只来自本浏览器里 DSH 已保存的项目 Key（不同工作区各一条），
      // 不向 JIRA 拉全量项目列表。
      var optionsState = React.useState(configuredProjectOptions);
      var options = optionsState[0];
      var setOptions = optionsState[1];
      var menuOpenState = React.useState(false);
      var menuOpen = menuOpenState[0];
      var setMenuOpen = menuOpenState[1];
      var highlightState = React.useState(-1);
      var highlight = highlightState[0];
      var setHighlight = highlightState[1];
      var comboRef = React.useRef(null);
      var draftKeyState = React.useState("");
      var draftKey = draftKeyState[0];
      var setDraftKey = draftKeyState[1];
      var activeKeyState = React.useState("");
      var activeKey = activeKeyState[0];
      var setActiveKey = activeKeyState[1];
      var phaseState = React.useState("idle"); // idle | loading | ready | error
      var phase = phaseState[0];
      var setPhase = phaseState[1];
      var statsState = React.useState(null);
      var stats = statsState[0];
      var setStats = statsState[1];
      var errorState = React.useState("");
      var error = errorState[0];
      var setError = errorState[1];
      // 手动刷新：只让刷新按钮转圈，不切整页 loading；失败时保留旧内容并提示。
      // 展开的工单详情（版本任务列表里的“详情”按钮共用）

      var refreshingState = React.useState(false);
      var refreshing = refreshingState[0];
      var setRefreshing = refreshingState[1];
      var refreshErrorState = React.useState("");
      var refreshError = refreshErrorState[0];
      var setRefreshError = refreshErrorState[1];
      var versionPageState = React.useState(1);
      var versionPage = versionPageState[0];
      var setVersionPage = versionPageState[1];
      // 点版本名进入的「版本任务列表」视图；null 时显示版本统计表。
      var selectedVersionState = React.useState(null);
      var selectedVersion = selectedVersionState[0];
      var setSelectedVersion = selectedVersionState[1];
      var versionPhaseState = React.useState("idle"); // idle | loading | ready | error
      var versionPhase = versionPhaseState[0];
      var setVersionPhase = versionPhaseState[1];
      var versionIssuesState = React.useState(null);
      var versionIssues = versionIssuesState[0];
      var setVersionIssues = versionIssuesState[1];
      var versionErrorState = React.useState("");
      var versionError = versionErrorState[0];
      var setVersionError = versionErrorState[1];
      var sortFieldState = React.useState("");
      var issueSortField = sortFieldState[0];
      var setIssueSortField = sortFieldState[1];
      var sortDirState = React.useState("asc");
      var issueSortDir = sortDirState[0];
      var setIssueSortDir = sortDirState[1];
      var versionRequestRef = React.useRef(0);
      var versionViewRef = React.useRef(null);
      var versionsViewRef = React.useRef(null);
      var versionViewSeenRef = React.useRef(false);
      var requestRef = React.useRef(0);

      // 统计某个项目编号：写回“上次查看”，并用请求序号丢弃过期响应。
      /**
       * 统计某个项目：有缓存就先渲染缓存内容，再在后台静默刷新（不切整页 loading）。
       * options.manual = 用户点「刷新」：只让刷新按钮转圈，失败保留旧内容并提示。
       * 换项目时才重置分页/版本任务视图；同项目刷新保留当前视图。
       */
      function loadStats(rawKey, options) {
        // JIRA 项目编号固定是大写；手输小写时统一转大写，避免无谓的 404/400。
        var key = String(rawKey || "").trim().toUpperCase();
        if (!key) return;
        var manual = !!(options && options.manual);
        var sameProject = key === activeKey;
        // 同一项目在 loading / 刷新中时忽略重复触发（回车、连点刷新）。
        if (sameProject && (phase === "loading" || refreshing)) return;

        var cached = readStatsCache(key);
        var token = ++requestRef.current;
        setDraftKey(key);
        setActiveKey(key);
        writeStatsProjectKey(key);
        if (!sameProject) {
          // 换项目：退出版本任务视图，版本列表回到第一页。
          versionRequestRef.current += 1;
          setVersionPage(1);
          setSelectedVersion(null);
          setVersionIssues(null);
          setVersionPhase("idle");
          setVersionError("");
          setIssueSortField("");
          setIssueSortDir("asc");
        }
        if (manual) setRefreshing(true);
        setRefreshError("");
        if (cached) {
          // 有缓存：立即显示旧内容，后台静默刷新。
          setStats(cached);
          setPhase("ready");
        } else if (!sameProject || phase !== "ready") {
          // 没有缓存可显示（首次打开该页 / 首次切到该项目）：才显示整页 loading。
          setStats(null);
          setError("");
          setPhase("loading");
        }

        queryStats(key).then(function (res) {
          if (token !== requestRef.current) return;
          if (manual) setRefreshing(false);
          if (res && res.ok) {
            setStats(res);
            setPhase("ready");
            writeStatsCache(key, res);
            return;
          }
          var message = (res && res.error) || "统计查询失败";
          if (cached || phase === "ready") {
            setRefreshError("刷新失败：" + message);
          } else {
            setStats(null);
            setError(message);
            setPhase("error");
          }
        }).catch(function (err) {
          if (token !== requestRef.current) return;
          if (manual) setRefreshing(false);
          var message = String((err && err.message) || err);
          if (cached || phase === "ready") {
            setRefreshError("刷新失败：" + message);
          } else {
            setStats(null);
            setError(message);
            setPhase("error");
          }
        });
      }

      React.useEffect(function () {
        var initial = readStatsProjectKey() || firstWorkspaceProjectKey();
        if (initial) loadStats(initial);
        return undefined;
      }, []);

      // 进入/返回版本任务视图时把焦点交给对应标题，避免焦点掉到 body。
      React.useEffect(function () {
        if (selectedVersion) versionViewSeenRef.current = true;
        if (!versionViewSeenRef.current) return;
        var node = selectedVersion ? versionViewRef.current : versionsViewRef.current;
        if (node && typeof node.focus === "function") {
          try { node.focus(); } catch (e) { /* 忽略不可聚焦的宿主环境 */ }
        }
      }, [selectedVersion]);

      // 组合框打开时，点面板外任意处关闭（mousedown 早于选项点击之外的失焦）。
      React.useEffect(function () {
        if (!menuOpen) return undefined;
        function onPointerDown(event) {
          var node = comboRef.current;
          if (node && event.target && node.contains(event.target)) return;
          setMenuOpen(false);
          setHighlight(-1);
        }
        document.addEventListener("mousedown", onPointerDown);
        return function () { document.removeEventListener("mousedown", onPointerDown); };
      }, [menuOpen]);

      function openMenu() {
        setOptions(configuredProjectOptions());
        setMenuOpen(true);
        setHighlight(-1);
      }

      function chooseProject(projectKey) {
        setMenuOpen(false);
        setHighlight(-1);
        loadStats(projectKey);
      }

      // Enter：有高亮选项就选它，否则统计输入框里的自定义 Key。
      // ↑/↓ 在选项间移动；Esc 收起。
      function handleComboKeyDown(event) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!menuOpen) openMenu();
          setHighlight(function (prev) {
            if (!filteredOptions.length) return -1;
            return prev < 0 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
          });
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          var wasClosed = !menuOpen;
          if (wasClosed) openMenu();
          setHighlight(function (prev) {
            if (!filteredOptions.length) return -1;
            if (wasClosed) return filteredOptions.length - 1;
            return prev <= 0 ? 0 : prev - 1;
          });
        } else if (event.key === "Enter") {
          if (menuOpen && highlight >= 0 && filteredOptions[highlight]) {
            event.preventDefault();
            chooseProject(filteredOptions[highlight].key);
          } else {
            setMenuOpen(false);
            setHighlight(-1);
            loadStats(draftKey);
          }
        } else if (event.key === "Escape") {
          setMenuOpen(false);
          setHighlight(-1);
        } else if (event.key === "Tab") {
          setMenuOpen(false);
        }
      }

      function versionRow(version, index) {
        var badge = versionBadge(version);
        var percent = roundPercent(version.done || 0, version.total || 0);
        return h("tr", { key: "v-" + String(version.name) + "-" + String(index) },
          h("td", null, h("button", {
            type: "button",
            className: "jtst-vlink",
            title: "查看该版本的任务列表",
            onClick: function () { openVersion(version); }
          }, String(version.name))),
          h("td", null, h("span", { className: badge.chipClass }, badge.chip)),
          h("td", null, version.releaseDate ? String(version.releaseDate) : "—"),
          h("td", { className: "jtst-num" }, String(version.total || 0)),
          h("td", { className: "jtst-num" }, String(version.todo || 0)),
          h("td", { className: "jtst-num" }, String(version.inProgress || 0)),
          h("td", { className: "jtst-num" }, String(version.done || 0)),
          h("td", null, h("span", { className: "jtst-progress" },
            h("span", { className: "jtst-bar-track" },
              h("span", { className: "jtst-bar-fill jtst-bar-fill-done", style: { width: percent + "%" } })),
            h("span", { className: "jtst-progress-text" }, version.total ? percent + "%" : "—")))
        );
      }

      function renderVersions(s) {
        var versions = (Array.isArray(s.versions) ? s.versions : []).slice().sort(compareVersionsByRecency);
        var totalPages = Math.max(1, Math.ceil(versions.length / VERSION_PAGE_SIZE));
        var page = Math.min(Math.max(versionPage, 1), totalPages);
        var startIndex = (page - 1) * VERSION_PAGE_SIZE;
        var pageVersions = versions.slice(startIndex, startIndex + VERSION_PAGE_SIZE);

        function goPage(nextPage) {
          setVersionPage(Math.min(Math.max(nextPage, 1), totalPages));
        }

        var table = versions.length
          ? h("div", { className: "jtst-tablewrap" },
            h("table", { className: "jtst-table" },
              h("thead", null, h("tr", null,
                h("th", null, "版本"),
                h("th", null, "状态"),
                h("th", null, "发布日期"),
                h("th", { className: "jtst-num" }, "任务"),
                h("th", { className: "jtst-num" }, "待办"),
                h("th", { className: "jtst-num" }, "进行中"),
                h("th", { className: "jtst-num" }, "已完成"),
                h("th", null, "完成率"))),
              h("tbody", null, pageVersions.map(function (version, index) {
                return versionRow(version, index);
              }))))
          : h("div", { className: "jtst-empty" }, "该项目还没有配置版本。");

        var pager = totalPages > 1
          ? h("div", { className: "jtst-pager" },
            h("span", { className: "jtst-pager-info" },
              "第 " + page + " / " + totalPages + " 页 · 共 " + versions.length + " 个版本"),
            h("button", {
              type: "button",
              className: "jtst-page-btn",
              disabled: page <= 1,
              onClick: function () { goPage(page - 1); }
            }, "上一页"),
            h("button", {
              type: "button",
              className: "jtst-page-btn",
              disabled: page >= totalPages,
              onClick: function () { goPage(page + 1); }
            }, "下一页"))
          : null;

        return h("section", { key: "versions", className: "jtst-section" },
          h("div", { className: "jtst-section-head" },
            h("h2", { className: "jtst-section-title", tabIndex: -1, ref: versionsViewRef }, "版本统计"),
            h("span", { className: "jtst-section-meta" },
              versions.length === 0
                ? "暂无版本"
                : (totalPages > 1
                  ? "最近 " + VERSION_PAGE_SIZE + " 个/页 · 共 " + versions.length + " 个版本"
                  : "共 " + versions.length + " 个版本"))),
          table,
          pager,
          h("div", { className: "jtst-foot" },
            "无版本任务 " + String(s.noVersionCount || 0) + " 条",
            h("div", null, "版本统计基于任务的 fixVersion 字段；一个任务可属于多个版本，所以各行任务数之和可能大于任务总数。")));
      }

      // ---- 版本任务列表（点版本名进入）----
      function openVersion(version) {
        var projectKey = String(activeKey || "").trim();
        if (!projectKey || !version || !version.name) return;
        var token = ++versionRequestRef.current;
        setSelectedVersion(version);
        setVersionIssues(null);
        setVersionPhase("loading");
        setVersionError("");
        setIssueSortField("");
        setIssueSortDir("asc");
        queryVersionIssues(projectKey, version.name).then(function (res) {
          if (token !== versionRequestRef.current) return;
          if (res && res.ok) {
            setVersionIssues(res);
            setVersionPhase("ready");
          } else {
            setVersionIssues(null);
            setVersionError((res && res.error) || "版本任务查询失败");
            setVersionPhase("error");
          }
        }).catch(function (err) {
          if (token !== versionRequestRef.current) return;
          setVersionIssues(null);
          setVersionError(String((err && err.message) || err));
          setVersionPhase("error");
        });
      }

      function closeVersion() {
        versionRequestRef.current += 1; // 丢弃未完成的响应
        setSelectedVersion(null);
        setVersionIssues(null);
        setVersionPhase("idle");
        setVersionError("");
      }

      function sortIssues(field) {
        if (issueSortField === field) {
          setIssueSortDir(issueSortDir === "asc" ? "desc" : "asc");
        } else {
          setIssueSortField(field);
          setIssueSortDir("asc");
        }
      }

      function sortedVersionIssueList() {
        var me = (versionIssues && versionIssues.me) || null;
        var list = (versionIssues && Array.isArray(versionIssues.issues) ? versionIssues.issues : []).slice();
        if (issueSortField) {
          list.sort(function (a, b) { return compareIssueValues(a, b, issueSortField, issueSortDir); });
        } else {
          list.sort(function (a, b) { return compareIssuesDefault(a, b, me); });
        }
        return list;
      }

      function renderVersionIssueTable(s) {
        var payload = versionIssues;
        var me = payload.me || null;
        var baseUrl = s.baseUrl || payload.baseUrl || "";
        var list = sortedVersionIssueList();
        var columns = [
          { field: "key", label: "编号" },
          { field: "summary", label: "摘要" },
          { field: "status", label: "状态" },
          { field: "priority", label: "优先级" },
          { field: "issueType", label: "类型" },
          { field: "assignee", label: "负责人" },
          { field: "updated", label: "更新" }
        ];
        var head = h("thead", null, h("tr", null, columns.map(function (column) {
          var active = issueSortField === column.field;
          var ariaSort = active ? (issueSortDir === "asc" ? "ascending" : "descending") : "none";
          return h("th", { key: column.field, "aria-sort": ariaSort },
            h("button", {
              type: "button",
              className: "jtst-sortbtn" + (active ? " is-active" : ""),
              title: "按" + column.label + "排序",
              onClick: function () { sortIssues(column.field); }
            }, column.label,
              h("span", {
                className: "jtst-sort-ind",
                "aria-hidden": "true"
              }, active ? (issueSortDir === "asc" ? "▲" : "▼") : "↕")));
        })));
        var rows = list.map(function (issue) {
          var mine = isMyIssue(issue, me);
          var statusClass = issue.statusCategory === "done"
            ? "jtst-chip jtst-chip-released"
            : (issue.statusCategory === "indeterminate" ? "jtst-chip jtst-chip-unreleased" : "jtst-chip");
          return h("tr", { key: issue.key, className: mine ? "is-mine" : undefined },
            h("td", null, h("a", {
              className: "jtst-issue-key",
              href: baseUrl ? baseUrl + "/browse/" + encodeURIComponent(issue.key) : undefined,
              target: baseUrl ? "_blank" : undefined,
              rel: "noreferrer",
              title: issue.key + " " + issue.summary
            }, issue.key),
              h("button", {
                type: "button",
                className: "jtd-toggle",
                title: "查看完整字段、评论与附件",
                onClick: function () {
                  openIssuePage({
                    issueKey: issue.key,
                    projectKey: activeKey,
                    baseUrl: baseUrl
                  });
                }
              }, "详情")),
            h("td", { className: "jtst-issue-summary", title: issue.summary }, issue.summary || "—"),
            h("td", null, h("span", { className: statusClass }, issue.status || "—")),
            h("td", null, issue.priority || "—"),
            h("td", null, issue.issueType || "—"),
            h("td", null, issue.assignee || "未分配", mine ? h("span", { className: "jtst-mine" }, "我") : null),
            h("td", { className: "jtst-num" }, formatDateTime(issue.updated) || "—"));
        });
        var table = h("div", { className: "jtst-tablewrap" },
          h("table", { className: "jtst-table jtst-issue-table" },
            head,
            h("tbody", null, rows.length > 0
              ? rows
              : [h("tr", { key: "empty" }, h("td", { colSpan: 7, className: "jtst-empty" }, "该版本下没有任务。"))])));
        return h("div", null,
          payload.truncated
            ? h("div", { className: "jtst-notice jtst-notice-warn", role: "status" },
              "该版本任务较多（共 " + String(payload.total) + " 条），列表只展示已获取的 " + String(payload.fetched) + " 条。")
            : null,
          table,

          h("div", { className: "jtst-foot" },
            "默认排序：本人任务在前，其余按更新时间倒序；点击表头可切换排序字段与方向。",
            h("div", null, "点击任务编号在新标签页打开 JIRA 详情。")));
      }

      function renderVersionIssues(s) {
        var version = selectedVersion;
        var versionName = String((version && version.name) || "");
        var head = h("div", { className: "jtst-section-head" },
          h("h2", { className: "jtst-section-title", tabIndex: -1, ref: versionViewRef }, "版本任务 · " + versionName),
          h("div", { className: "jtst-section-actions" },
            h("span", { className: "jtst-section-meta" },
              versionPhase === "ready" && versionIssues
                ? "共 " + String(versionIssues.total) + " 条"
                : ""),
            issueSortField
              ? h("button", {
                type: "button",
                className: "jtst-linkbtn",
                onClick: function () { setIssueSortField(""); setIssueSortDir("asc"); }
              }, "恢复默认排序")
              : null,
            h("button", { type: "button", className: "jtst-linkbtn", onClick: closeVersion }, "← 返回版本列表")));

        var body;
        if (versionPhase === "loading") {
          body = h("div", { className: "jtst-loading", role: "status" },
            spinnerIcon(14),
            h("span", null, "正在加载 " + versionName + " 的任务…"));
        } else if (versionPhase === "error") {
          body = h("div", { className: "jtst-error", role: "alert" }, "加载失败：" + versionError);
        } else if (versionPhase === "ready" && versionIssues) {
          body = renderVersionIssueTable(s);
        } else {
          body = null;
        }

        return h("section", { key: "version-issues", className: "jtst-section" }, head, body);
      }

      function renderReady(s) {
        var sum = s.summary || { total: 0, done: 0, inProgress: 0, todo: 0 };
        var total = sum.total || 0;
        var completion = roundPercent(sum.done || 0, total);
        var cards = [
          { label: "任务总数", value: String(s.total), note: s.truncated ? "共 " + s.total + " 条；仅统计前 " + s.fetched + " 条" : "项目全部任务" },
          { label: "已完成", value: String(sum.done || 0), note: "占 " + formatShare(sum.done || 0, total) },
          { label: "进行中", value: String(sum.inProgress || 0), note: "占 " + formatShare(sum.inProgress || 0, total) },
          { label: "待办", value: String(sum.todo || 0), note: "占 " + formatShare(sum.todo || 0, total) },
          { label: "完成率", value: completion + "%", note: "已完成 / 已统计任务" }
        ];

        var nodes = [];
        nodes.push(h("div", { key: "cards", className: "jtst-cards" }, cards.map(function (card) {
          return h("div", { key: card.label, className: "jtst-card" },
            h("div", { className: "jtst-card-label" }, card.label),
            h("div", { className: "jtst-card-value" }, card.value),
            h("div", { className: "jtst-card-note" }, card.note));
        })));

        if (s.truncated) {
          nodes.push(h("div", { key: "truncated", className: "jtst-notice jtst-notice-warn", role: "status" },
            "任务总数 " + s.total + " 条，已达到统计上限或时间预算（已统计 " + String(s.fetched) + " 条），以下版本统计只基于这些任务。"));
        }

        if (total === 0) {
          nodes.push(h("div", { key: "empty", className: "jtst-empty" }, "该项目暂无任务。"));
        }

        nodes.push(selectedVersion ? renderVersionIssues(s) : renderVersions(s));
        return h.apply(null, ["div", null].concat(nodes));
      }

      // 可下拉的输入框：既是文本框（可输入自定义项目 Key），也是已配置 Key 的选择器。
      function renderProjectPicker(visibleOptions) {
        var emptyText = options.length === 0
          ? "还没有已配置的项目 Key——先在会话面板的 ⚙ 里配置项目，或直接输入编号后回车。"
          : "没有匹配的项目 Key，回车可直接统计 " + (String(draftKey || "").trim().toUpperCase() || "当前输入") + "。";
        var optionNodes = visibleOptions.map(function (option, index) {
          return h("li", {
            key: option.key,
            id: "jtst-project-option-" + index,
            role: "option",
            "aria-selected": index === highlight ? "true" : "false",
            className: "jtst-combo-option" + (index === highlight ? " is-active" : ""),
            onMouseDown: function (event) { event.preventDefault(); chooseProject(option.key); },
            onMouseEnter: function () { setHighlight(index); }
          },
            h("span", { className: "jtst-combo-key" }, option.key),
            option.hint ? h("span", { className: "jtst-combo-hint" }, option.hint) : null);
        });
        return h("div", { className: "jtst-combo", ref: comboRef },
          h("input", {
            id: "jtst-project-key",
            className: "jtst-combo-input",
            type: "text",
            role: "combobox",
            "aria-label": "项目 Key",
            "aria-expanded": menuOpen ? "true" : "false",
            "aria-controls": "jtst-project-options",
            "aria-autocomplete": "list",
            "aria-activedescendant": menuOpen && highlight >= 0 && visibleOptions[highlight]
              ? "jtst-project-option-" + highlight
              : undefined,
            autoComplete: "off",
            spellCheck: false,
            value: draftKey,
            placeholder: "选择或输入项目 Key",
            onChange: function (event) {
              setDraftKey(event.target.value);
              setOptions(configuredProjectOptions());
              setMenuOpen(true);
              setHighlight(-1);
            },
            onFocus: function () { if (!menuOpen) openMenu(); },
            onClick: function () { if (!menuOpen) openMenu(); },
            onKeyDown: handleComboKeyDown
          }),
          h("button", {
            type: "button",
            className: "jtst-combo-toggle",
            tabIndex: -1,
            "aria-label": menuOpen ? "收起项目列表" : "展开项目列表",
            onMouseDown: function (event) { event.preventDefault(); },
            onClick: function () {
              if (menuOpen) {
                setMenuOpen(false);
                setHighlight(-1);
                return;
              }
              openMenu();
              var input = comboRef.current && comboRef.current.querySelector("input");
              if (input) input.focus();
            }
          }, menuOpen ? "▴" : "▾"),
          menuOpen
            ? h("ul", { id: "jtst-project-options", className: "jtst-combo-list", role: "listbox" },
              optionNodes.length > 0
                ? optionNodes
                : h("li", { className: "jtst-combo-empty", role: "presentation" }, emptyText))
            : null);
      }

      function renderFoot(s) {
        return h("div", { className: "jtst-foot" },
          "统计对象：" + s.projectKey + " · 任务 " + String(s.fetched) + " / " + String(s.total) + " 条 · 更新于 " + formatClock(s.fetchedAt),
          h("div", null, "数据来自 JIRA REST API；JIRA 地址与令牌在「设置 → JIRA 配置」中维护。"));
      }

      var projectTitle = (activeKey || draftKey || "").trim();
      var subtitleParts = [];
      if (projectTitle) subtitleParts.push(projectTitle);
      subtitleParts.push(phase === "ready" && stats
        ? "统计 " + String(stats.fetched) + " / " + String(stats.total) + " 条任务"
        : "选择或输入项目 Key 后统计");

      // 输入即过滤：命中 Key 本身，或命中工作区提示（例如路径末段）。
      // 但输入框显示的正好是当前项目时不按它过滤——否则展开下拉只剩当前这一项，
      // 没法在其中切换到其它已配置的项目。
      var typedKey = String(draftKey || "").trim().toUpperCase();
      var filterText = typedKey && typedKey !== String(activeKey || "").trim().toUpperCase() ? typedKey : "";
      var filteredOptions = options.filter(function (option) {
        if (!filterText) return true;
        return option.key.indexOf(filterText) !== -1
          || String(option.hint || "").toUpperCase().indexOf(filterText) !== -1;
      });

      var toolbar = h("div", { className: "jtst-toolbar" },
        h("label", { className: "jtst-label", htmlFor: "jtst-project-key" }, "项目 Key"),
        renderProjectPicker(filteredOptions),
        h("button", {
          type: "button",
          className: "jtst-btn jtst-btn-primary",
          disabled: phase === "loading" || !(draftKey || "").trim(),
          onClick: function () { loadStats(draftKey); }
        }, phase === "loading" ? "统计中…" : "查询"),
        h("button", {
          type: "button",
          className: "jtst-btn",
          title: refreshing ? "正在刷新…" : "重新统计当前项目（后台刷新，不打断当前内容）",
          disabled: phase === "loading" || refreshing || !activeKey,
          "aria-busy": refreshing ? "true" : "false",
          onClick: function () { loadStats(activeKey, { manual: true }); }
        },
          refreshing
            ? spinnerIcon(13)
            : "⟳",
          h("span", null, refreshing ? "刷新中…" : "刷新")),
        h("span", { className: "jtst-status" }, refreshing
          ? "刷新中…"
          : (phase === "loading"
            ? "正在统计…"
            : (phase === "ready" && stats ? "更新于 " + formatClock(stats.fetchedAt) : ""))));

      var content;
      if (phase === "loading") {
        content = h("div", { className: "jtst-loading", role: "status" },
          spinnerIcon(14),
          h("span", null, "正在统计 " + activeKey + " 的任务…（任务较多的项目需要几秒）"));
      } else if (phase === "error") {
        content = h("div", { className: "jtst-error", role: "alert" }, "统计失败：" + error);
      } else if (phase === "ready" && stats && stats.summary) {
        content = renderReady(stats);
      } else {
        content = h("div", { className: "jtst-idle" },
          h("div", null, "从下拉里选择 DSH 中已配置的项目 Key，或直接输入项目编号后回车。"),
          h("div", null, "统计页会显示该项目的任务概览与版本统计（最近 10 个/页，可翻页）。"));
      }

      return h("div", { className: "jtst-page" },
        h("div", { className: "jtst-inner" },
          h("div", { className: "jtst-head" },
            h("div", { className: "jtst-headmain" },
              h("h1", { className: "jtst-title" }, "JIRA 任务统计"),
              h("p", { className: "jtst-sub" }, subtitleParts.join(" · ")))),
          toolbar,
          refreshError
            ? h("div", { className: "jtst-notice jtst-notice-warn", role: "status" }, refreshError)
            : null,
          content,
          phase === "ready" && stats ? renderFoot(stats) : null));
    }

    function JiraTasksDock(props) {
      var useWorkspaces = props && typeof props.useWorkspaces === "function" ? props.useWorkspaces : null;
      var sessionId = props && props.sessionId;
      var wsState = useWorkspaces ? useWorkspaces(function (s) { return s; }) : null;
      var wsKey = "";
      var wsTitle = "";
      try {
        if (sessionId && wsState && wsState.items && Array.isArray(wsState.items)) {
          var item = wsState.items.find(function (w) { return w.sessionIds && w.sessionIds.indexOf(sessionId) !== -1; });
          if (item) { wsKey = String(item.path || item.workspaceId || ""); wsTitle = String(item.title || ""); }
        }
      } catch (e) {}

      var configState = React.useState(function () { return loadConfigFor(wsKey); });
      var config = configState[0], setConfig = configState[1];
      var phaseState = React.useState("idle");
      var phase = phaseState[0], setPhase = phaseState[1];
      var resultState = React.useState(null);
      var result = resultState[0], setResult = resultState[1];
      var tickState = React.useState(0);
      var tick = tickState[0], setTick = tickState[1];
      var editingState = React.useState(false);
      var editing = editingState[0], setEditing = editingState[1];
      var collapsedState = React.useState(true);
      var collapsed = collapsedState[0], setCollapsed = collapsedState[1];

      var draftKeyState = React.useState("");
      var draftKey = draftKeyState[0], setDraftKey = draftKeyState[1];
      var draftJqlState = React.useState("");
      var draftJql = draftJqlState[0], setDraftJql = draftJqlState[1];

      React.useEffect(function () { setConfig(loadConfigFor(wsKey)); }, [wsKey]);

      React.useEffect(function () {
        var key = (config.projectKey || "").trim();
        if (!key) { setPhase("idle"); setResult(null); return; }
        var cancelled = false;
        setPhase("loading");
        query(key, (config.jql || "").trim())
          .then(function (res) {
            if (cancelled) return;
            setResult(res || null);
            setPhase(res && res.ok ? "ready" : "error");
          })
          .catch(function (err) {
            if (cancelled) return;
            setResult({ ok: false, error: String((err && err.message) || err) });
            setPhase("error");
          });
        return function () { cancelled = true; };
      }, [config, tick]);

      // 面板只注册 conversation.input.dock 一处（见 apply 里的说明）：
      // 该槽位在“新会话”和“活跃会话”下都会渲染，且是整行纵向排布的元素，
      // 因此这里没有“仅空白会话显示”的分支，也不需要去重。
      function openEditor() {
        setDraftKey(config.projectKey);
        setDraftJql(config.jql || defaultJql(config.projectKey));
        setEditing(true);
      }
      function saveEditor() {
        var next = { projectKey: (draftKey || "").trim(), jql: (draftJql || "").trim() };
        saveConfigFor(wsKey, next);
        setConfig(next);
        setEditing(false);
      }

      if (editing) {
        return h("div", { className: "jt-root jt-hero" },
          h("div", { className: "jt-panel" },
            h("div", { className: "jt-header" }, h("span", { className: "jt-title" }, "JIRA 任务设置")),
            h("div", { className: "jt-body" },
              h("div", { className: "jt-hint", style: { marginBottom: "8px" } }, "配置保存到当前工作区：" + (wsTitle || wsKey || "（无工作区）")),
              h("div", { className: "jt-field" },
                h("label", null, "项目 Key"),
                h("input", {
                  className: "jt-input", value: draftKey, placeholder: "例如 ROMS",
                  onChange: function (e) {
                    var nextKey = e.target.value;
                    setDraftKey(nextKey);
                    setDraftJql(function (prev) { return prev === defaultJql(draftKey) ? defaultJql(nextKey) : prev; });
                  },
                  onKeyDown: function (e) { if (e.key === "Enter") saveEditor(); }
                })
              ),
              h("div", { className: "jt-field" },
                h("label", null, "JQL（留空则使用默认查询；{projectKey} 会被替换为项目 Key）"),
                h("textarea", {
                  className: "jt-input jt-textarea", value: draftJql, rows: 4, placeholder: defaultJql(""),
                  onChange: function (e) { setDraftJql(e.target.value); }
                })
              ),
              h("div", { className: "jt-buttons" },
                h("button", { className: "jt-btn", onClick: function () { setEditing(false); } }, "取消"),
                h("button", { className: "jt-btn jt-btn-primary", onClick: saveEditor }, "保存并查询")
              )
            )
          )
        );
      }

      var projectKey = (config.projectKey || "").trim();
      var error = result && !result.ok ? result.error : "";
      var count = result && result.ok && typeof result.total === "number" ? result.total : null;
      var baseUrl = result && result.ok ? result.baseUrl : "";

      var rows = (result && result.ok && Array.isArray(result.issues) ? result.issues : []).map(function (issue) {
        var chipClass = issue.statusCategory === "new" ? "jt-chip jt-chip-new" : (issue.statusCategory === "indeterminate" ? "jt-chip jt-chip-progress" : "jt-chip");
        var meta = [];
        if (issue.status) meta.push(h("span", { className: chipClass }, issue.status));
        if (issue.priority) meta.push(h("span", null, issue.priority));
        if (issue.issueType) meta.push(h("span", null, issue.issueType));
        return h("li", { key: issue.key, className: "jt-item" },
          h("a", {
            className: "jt-row",
            href: baseUrl ? baseUrl + "/browse/" + encodeURIComponent(issue.key) : undefined,
            target: baseUrl ? "_blank" : undefined,
            rel: "noreferrer",
            title: issue.key + " " + issue.summary
          },
            h("span", { className: "jt-key" }, issue.key),
            h("span", { className: "jt-summary" }, issue.summary),
            h("span", { className: "jt-meta" }, meta.length > 0 ? meta : null)
          ),
          h("button", {
            type: "button",
            className: "jtd-toggle",
            title: "打开工单详情页",
            onClick: function () {
              openIssuePage({
                issueKey: issue.key,
                sessionId: sessionId,
                projectKey: projectKey,
                baseUrl: result && result.ok ? result.baseUrl : ""
              });
            }
          }, "详情")
        );
      });

      var body;
      if (phase === "loading") {
        body = h("div", { className: "jt-hint" }, "正在查询 JIRA 任务…");
      } else if (phase === "error") {
        body = h("div", { className: "jt-error" }, "查询失败：" + error);
      } else if (phase === "ready") {
        body = rows.length > 0 ? h("ul", { className: "jt-list" }, rows) : h("div", { className: "jt-empty" }, "该项目暂无未解决的任务");
      } else {
        body = h("div", { className: "jt-hint" }, "未设置 JIRA 项目 Key，", h("button", { className: "jt-linklike", onClick: openEditor }, "点击配置"));
      }

      return h("div", { className: "jt-root jt-hero" },
        h("div", { className: "jt-panel" },
          h("div", { className: "jt-header" },
            h("button", {
              className: "jt-toggle",
              onClick: function () { setCollapsed(!collapsed); },
              title: collapsed ? "展开" : "收起"
            },
              h("span", { className: "jt-chevron" }, collapsed ? "▸" : "▾"),
              h("span", { className: "jt-title" }, "JIRA · " + (projectKey || "未配置")),
              count !== null ? h("span", { className: "jt-badge" }, String(count)) : null
            ),
            h("div", { className: "jt-actions" },
              h("button", { className: "jt-action", title: "刷新", onClick: function () { setTick(tick + 1); } }, "⟳"),
              h("button", { className: "jt-action", title: "设置项目 Key / JQL", onClick: openEditor }, "⚙")
            )
          ),
          collapsed ? null : h("div", { className: "jt-body" }, body)
        )
      );
    }

    // ---- 设置页卡片：设置 → 插件 → JIRA ----
    // 地址存 settings 命名空间（可读）；令牌写 credentials（永不随响应回传）。
    var SETTINGS_NS = "jira-tasks";
    // 令牌写入插件自有引用，而不是直接写 JIRA_API_TOKEN：启动环境里导出的
    // JIRA_API_TOKEN 会让那个引用只读（DSH 拒绝写入会被环境遮蔽的引用），而
    // 插件自有引用不受影响，因此设置页保存的值可以覆盖环境变量——优先级由
    // Host 的解析顺序保证（JIRA_TASKS_TOKEN → JIRA_API_TOKEN → JIRA_TOKEN）。
    var TOKEN_REF = "JIRA_TASKS_TOKEN";
    var ENV_TOKEN_REFS = ["JIRA_API_TOKEN", "JIRA_TOKEN"];
    var TOKEN_REFS = [TOKEN_REF].concat(ENV_TOKEN_REFS);
    // 账号（用户名）不是机密：写进插件自己的 Config（明文），因此可以回显、可以显示当前账号。
    // 密码是机密：只写凭据存储引用，绝不进 Config——Config 会明文落到 cordis.patch.yml。
    var PASSWORD_REF = "JIRA_TASKS_PASSWORD";
    var ENV_PASSWORD_REFS = ["JIRA_PASSWORD"];
    var PASSWORD_REFS = [PASSWORD_REF].concat(ENV_PASSWORD_REFS);
    // 认证规则提示：始终显示，不随配置状态变化。Basic/Bearer 的最终优先级由 Host 保证
    // （显式账号密码 > 含 “:” 的旧值 > 纯令牌）。
    var AUTH_RULE_HINT = "账号密码填「用户名 + 密码」两栏（自动 Basic）；只填令牌则按 PAT/Bearer 使用。"
      + "含 “:” 的旧值仍按 Basic 处理。"
      + "Jira Cloud 只接受「邮箱 + API token」，不接受真密码。";

    // credentials-local 拒绝写入“由启动环境提供”的引用时，原始信息是英文的；这里取出引用名并给出可操作的中文说明。
    function shadowedTokenRef(message) {
      var m = /"([^"]+)" is supplied read-only by the launching environment/.exec(String(message || ""));
      return m ? m[1] : "";
    }
    // 只读提示的通用实现：ref 为空时回落到 defaultRef（令牌与密码共用同一段文案，
    // 消息里带的是引用名，不含任何机密值）。
    function tokenReadOnlyHint(ref, defaultRef) {
      var name = ref || defaultRef || TOKEN_REF;
      return "环境变量 " + name + " 由启动 DSH 的终端提供且只读，无法写入该引用。"
        + "请先移除它（Windows：系统属性 → 环境变量，或 PowerShell "
        + "[Environment]::SetEnvironmentVariable('" + name + "', $null, 'User')）并重启 DSH。";
    }
    // 密码引用的只读提示：与令牌共用同一段文案，只是默认回落的名字不同。
    function passwordReadOnlyHint(ref) {
      return tokenReadOnlyHint(ref, PASSWORD_REF);
    }

    function useScopeSnapshot(scope) {
      var state = React.useState(function () { return scope.getSnapshot(); });
      var snapshot = state[0], setSnapshot = state[1];
      React.useEffect(function () {
        var update = function () { setSnapshot(scope.getSnapshot()); };
        var off = scope.subscribe(update);
        update();
        return off;
      }, []);
      return snapshot;
    }

    // 返回两处渲染位的组件：{ card } 给 plugins.item，{ section } 给 settings.section。
    // 两者共用同一个 JiraSettingsPage 与同一份 scope / credentials 句柄。
    function createJiraSettingsSurfaces(scope, credentials) {
      function readTokenInfo() {
        return credentials.describe(TOKEN_REFS).then(function (res) {
          if (!res || !res.ok || !res.value) return { configured: false, writable: true };
          var value = res.value;
          var override = value[TOKEN_REF];
          var overridden = !!(override && override.configured);
          var fallbackRef = "", fallbackSource = "";
          for (var i = 0; i < ENV_TOKEN_REFS.length; i++) {
            var info = value[ENV_TOKEN_REFS[i]];
            if (info && info.configured) {
              fallbackRef = ENV_TOKEN_REFS[i];
              fallbackSource = info.source || "";
              break;
            }
          }
          return {
            configured: overridden || fallbackRef !== "",
            overridden: overridden,
            // 只有插件自有引用可能被环境遮蔽；JIRA_API_TOKEN 只读不影响这里的写入。
            writable: !override || override.writable !== false,
            // 仅当回退值确实来自启动环境时才称它为“环境变量”（旧版本可能把它存在凭据文件里）。
            envRef: fallbackSource === "env" ? fallbackRef : ""
          };
        }).catch(function () {
          // 状态读取失败不阻断保存，交由写入路径给出真实错误。
          return { configured: false, writable: true };
        });
      }

      // 密码引用的状态：与令牌同构，但密码永远不读回来（只有“是否已配置”的布尔量）。
      function readPasswordInfo() {
        return credentials.describe(PASSWORD_REFS).then(function (res) {
          if (!res || !res.ok || !res.value) return { configured: false, writable: true };
          var value = res.value;
          var override = value[PASSWORD_REF];
          var overridden = !!(override && override.configured);
          var fallbackRef = "", fallbackSource = "";
          for (var i = 0; i < ENV_PASSWORD_REFS.length; i++) {
            var info = value[ENV_PASSWORD_REFS[i]];
            if (info && info.configured) {
              fallbackRef = ENV_PASSWORD_REFS[i];
              fallbackSource = info.source || "";
              break;
            }
          }
          return {
            configured: overridden || fallbackRef !== "",
            overridden: overridden,
            // 只有插件自有引用可能被环境遮蔽；JIRA_PASSWORD 只读不影响这里的写入。
            writable: !override || override.writable !== false,
            // 仅当回退值确实来自启动环境时才称它为“环境变量”。
            envRef: fallbackSource === "env" ? fallbackRef : ""
          };
        }).catch(function () {
          return { configured: false, writable: true };
        });
      }

      // 同一个表单服务两处渲染位：
      // - plugins.item：列表里的卡片摘要（view="summary"）与点开后的详情（其余 view）；
      // - settings.section：设置导航里的整页（variant="page"）。
      // 分发组件自身不调用任何 hook，钩子全部留在 JiraSettingsPage 里，这样同一个实例
      // 的 hook 数量与 view 取值无关——这是 React 的硬性要求，早期版本把摘要提前 return
      // 写在 hook 之前会踩这条规则。
      function JiraSettingsPage(props) {
        // "page" = 设置对话框左侧导航的整页（settings.section）；默认 = 插件面板里的卡片。
        var asPage = !!(props && props.variant === "page");
        var snapshot = useScopeSnapshot(scope);
        var tokenInfoState = React.useState(null);
        var tokenInfo = tokenInfoState[0], setTokenInfo = tokenInfoState[1];
        var passwordInfoState = React.useState(null);
        var passwordInfo = passwordInfoState[0], setPasswordInfo = passwordInfoState[1];
        var baseEditState = React.useState(undefined);
        var baseEdit = baseEditState[0], setBaseEdit = baseEditState[1];
        // 用户名存 Config（明文、非机密），因此能回显；undefined = 未编辑，用已存值。
        var usernameEditState = React.useState(undefined);
        var usernameEdit = usernameEditState[0], setUsernameEdit = usernameEditState[1];
        var tokenDraftState = React.useState("");
        var tokenDraft = tokenDraftState[0], setTokenDraft = tokenDraftState[1];
        // 密码只写不读：这里永远只是本次输入的草稿，保存后清空。
        var passwordDraftState = React.useState("");
        var passwordDraft = passwordDraftState[0], setPasswordDraft = passwordDraftState[1];
        var busyState = React.useState(false);
        var busy = busyState[0], setBusy = busyState[1];
        var failedState = React.useState("");
        var failed = failedState[0], setFailed = failedState[1];
        var probeState = React.useState({ phase: "idle" });
        var probe = probeState[0], setProbe = probeState[1];
        var probeGen = React.useRef(0);

        React.useEffect(function () {
          var alive = true;
          readTokenInfo().then(function (info) { if (alive) setTokenInfo(info); });
          readPasswordInfo().then(function (info) { if (alive) setPasswordInfo(info); });
          return function () { alive = false; };
        }, []);

        // 自动测试：命名空间就绪后、以及已保存配置变更（含保存后）时各探测一次。
        React.useEffect(function () {
          if (snapshot.status !== "ready") return;
          runProbe({});
        }, [snapshot.status, snapshot.revision]);

        var storedBase = snapshot.value && typeof snapshot.value.baseUrl === "string" ? snapshot.value.baseUrl : "";
        var baseValue = baseEdit === undefined ? storedBase : baseEdit;
        var baseDirty = baseEdit !== undefined && baseEdit !== storedBase;
        // 用户名在 Config 里（明文、非机密），所以可以直接回显。
        var storedUsername = snapshot.value && typeof snapshot.value.username === "string" ? snapshot.value.username : "";
        var usernameValue = usernameEdit === undefined ? storedUsername : usernameEdit;
        var usernameDirty = usernameEdit !== undefined && usernameEdit !== storedUsername;
        var tokenDraftText = (tokenDraft || "").trim();
        var tokenDirty = tokenDraftText.length > 0;
        // 密码不 trim：首尾空格有意义。空草稿 = 保持不变（凭据服务拒绝空串）。
        var passwordDirty = (passwordDraft || "").length > 0;
        var dirty = baseDirty || usernameDirty || tokenDirty || passwordDirty;
        var writable = snapshot.writable !== false;
        // 插件自有引用通常可写；只有 JIRA_TASKS_TOKEN 本身也被导出到启动环境时才会只读。
        var tokenWritable = !tokenInfo || tokenInfo.writable !== false;
        var tokenOverridden = !!(tokenInfo && tokenInfo.overridden);
        var envTokenRef = tokenInfo && tokenInfo.envRef ? tokenInfo.envRef : "";
        // 密码引用同理：只有 JIRA_TASKS_PASSWORD 本身被导出到启动环境时才只读。
        var passwordWritable = !passwordInfo || passwordInfo.writable !== false;
        var passwordOverridden = !!(passwordInfo && passwordInfo.overridden);
        var envPasswordRef = passwordInfo && passwordInfo.envRef ? passwordInfo.envRef : "";

        // 命名空间未挂载时不显示，避免留下一张无法操作的卡片。
        if (snapshot.status === "unavailable") return null;

        function save() {
          if (busy || !dirty) return;
          if (tokenDirty && !tokenWritable) {
            setFailed(tokenReadOnlyHint(TOKEN_REF));
            return;
          }
          if (passwordDirty && !passwordWritable) {
            setFailed(passwordReadOnlyHint(PASSWORD_REF));
            return;
          }
          setBusy(true);
          setFailed("");
          var tasks = [];
          if (baseDirty) {
            // ConfigForm.set/unset 解析为 boolean：false = 宿主拒绝写入或连接处于
            // memory 模式。以前忽略返回值会让面板“看起来保存了”，实际没落盘。
            tasks.push((baseEdit === "" ? scope.unset("baseUrl") : scope.set("baseUrl", baseEdit)).then(function (accepted) {
              if (accepted === false) throw new Error("JIRA 地址保存被宿主拒绝（该命名空间只读，或连接处于 memory 模式）");
            }));
          }
          if (usernameDirty) {
            // 用户名不是机密：写 Config（明文），空串视为清除。密码绝不进 Config。
            var usernameText = (usernameEdit || "").trim();
            tasks.push((usernameText === "" ? scope.unset("username") : scope.set("username", usernameText)).then(function (accepted) {
              if (accepted === false) throw new Error("用户名保存被宿主拒绝（该命名空间只读，或连接处于 memory 模式）");
            }));
          }
          if (tokenDirty) {
            tasks.push(credentials.set(TOKEN_REF, tokenDraftText).then(function (res) {
              if (res && res.ok === false) {
                var err = res.error;
                throw new Error((err && (err.message || err.code)) || "令牌保存失败");
              }
            }));
          }
          if (passwordDirty) {
            // 密码只写凭据存储（0600 的 credentials 文件）；原样写入不 trim，
            // 首尾空格有意义。凭据服务拒绝空串，所以这里只在草稿非空时调用。
            tasks.push(credentials.set(PASSWORD_REF, passwordDraft).then(function (res) {
              if (res && res.ok === false) {
                var err = res.error;
                throw new Error((err && (err.message || err.code)) || "密码保存失败");
              }
            }));
          }
          Promise.all(tasks).then(function () {
            return Promise.all([readTokenInfo(), readPasswordInfo()]);
          }).then(function (infos) {
            setTokenInfo(infos[0]);
            setPasswordInfo(infos[1]);
            setBaseEdit(undefined);
            setUsernameEdit(undefined);
            setTokenDraft("");
            setPasswordDraft("");
            setBusy(false);
            // baseUrl / username 变更会经 snapshot.revision 触发自动重测；仅保存凭据时手动补一次。
            if (!baseDirty && !usernameDirty) runProbe({});
          }).catch(function (err) {
            setBusy(false);
            var shadowed = shadowedTokenRef(err && err.message);
            setFailed(shadowed ? tokenReadOnlyHint(shadowed) : String((err && err.message) || err));
          });
        }

        // 清除设置页保存的值，回退到环境变量 / 凭据文件里的旧值。
        // 三样一起清：令牌引用、密码引用、Config 里的用户名。
        // 用户名必须一起清——它在 Config 里的优先级高于环境变量，只清密码会得到
        // “Config 用户名 + 环境密码”这样不匹配的一对 Basic 账号。
        function clearOverride() {
          if (busy) return;
          setBusy(true);
          setFailed("");
          var tasks = [];
          // 只清插件自有引用：环境变量引用由启动环境提供，既不可写也不该由我们清。
          if (tokenOverridden && tokenWritable) {
            tasks.push(credentials.unset(TOKEN_REF).then(function (res) {
              if (res && res.ok === false) {
                var err = res.error;
                throw new Error((err && (err.message || err.code)) || "清除令牌失败");
              }
            }));
          }
          if (passwordOverridden && passwordWritable) {
            tasks.push(credentials.unset(PASSWORD_REF).then(function (res) {
              if (res && res.ok === false) {
                var err = res.error;
                throw new Error((err && (err.message || err.code)) || "清除密码失败");
              }
            }));
          }
          if (storedUsername.trim()) {
            tasks.push(scope.unset("username").then(function (accepted) {
              if (accepted === false) throw new Error("用户名清除被宿主拒绝（该命名空间只读，或连接处于 memory 模式）");
            }));
          }
          Promise.all(tasks).then(function () {
            return Promise.all([readTokenInfo(), readPasswordInfo()]);
          }).then(function (infos) {
            setTokenInfo(infos[0]);
            setPasswordInfo(infos[1]);
            setBaseEdit(undefined);
            setUsernameEdit(undefined);
            setTokenDraft("");
            setPasswordDraft("");
            setBusy(false);
            runProbe({});
          }).catch(function (err) {
            setBusy(false);
            var shadowed = shadowedTokenRef(err && err.message);
            setFailed(shadowed ? tokenReadOnlyHint(shadowed) : String((err && err.message) || err));
          });
        }

        function discard() {
          setBaseEdit(undefined);
          setUsernameEdit(undefined);
          setTokenDraft("");
          setPasswordDraft("");
          setFailed("");
        }

        // 探测连接：payload 传入即测草稿，传空对象则测已保存/环境配置。
        // Host 在成功与失败响应里都带 authMode（实际生效的认证方式），这里透传出去，
        // 供状态行区分 Basic 与 Bearer。
        function runProbe(payload) {
          var gen = ++probeGen.current;
          setProbe({ phase: "testing", message: "正在测试连接…", authMode: "" });
          testConnection(payload).then(function (res) {
            if (gen !== probeGen.current) return;
            var mode = res && typeof res.authMode === "string" ? res.authMode : "";
            if (res && res.ok) setProbe({ phase: "ok", message: "可用" + (res.user ? "：" + res.user : ""), authMode: mode });
            else if (res && res.code === "unconfigured") setProbe({ phase: "idle", message: "未配置地址或令牌", authMode: mode });
            else setProbe({ phase: "fail", message: (res && res.error) || "不可用", authMode: mode });
          }).catch(function (err) {
            if (gen !== probeGen.current) return;
            setProbe({ phase: "fail", message: String((err && err.message) || err), authMode: "" });
          });
        }

        var tokenHint = (tokenInfo === null
          ? "正在读取令牌状态…"
          : (tokenOverridden
            ? "设置页令牌已保存" + (envTokenRef ? "，优先于环境变量 " + envTokenRef : "") + "；留空并保存可保持不变。"
            : (envTokenRef
              ? "当前使用环境变量 " + envTokenRef + "；在下方填写并保存即可覆盖它。"
              : (tokenInfo.configured ? "令牌已配置；留空并保存可保持不变。" : "令牌未配置。"))))
          + " " + AUTH_RULE_HINT;
        var passwordHint = passwordInfo === null
          ? "正在读取密码状态…"
          : (passwordOverridden
            ? "密码已保存到凭据存储" + (envPasswordRef ? "，优先于环境变量 " + envPasswordRef : "") + "；留空并保存可保持不变。"
            : (envPasswordRef
              ? "当前使用环境变量 " + envPasswordRef + "；在下方填写并保存即可覆盖它。"
              : (passwordInfo.configured ? "密码已配置；留空并保存可保持不变。" : "密码未配置。")));
        // 当前生效的认证方式：来自 Host 返回的 authMode。Basic 分支只显示本地可见的
        // 用户名（Config / 草稿），绝不回显任何机密。
        var authModeText = (function () {
          var mode = probe.authMode;
          if (!mode) return probe.phase === "testing" ? "当前认证方式：测试中…" : "当前认证方式：未知";
          if (mode === "basic") {
            var account = (usernameValue || "").trim();
            return "当前认证方式：Basic" + (account ? "（账号 " + account + "）" : "");
          }
          if (mode === "bearer") return "当前认证方式：Bearer（访问令牌 / PAT）";
          return "当前认证方式：" + mode;
        })();
        var dotClass = probe.phase === "ok" ? "jt-dot jt-dot-ok"
          : probe.phase === "fail" ? "jt-dot jt-dot-fail"
            : probe.phase === "testing" ? "jt-dot jt-dot-testing" : "jt-dot";

        // 字段区在两种形态下完全一致，只有外层容器不同：插件面板卡片（li.jt-set-card）
        // vs 设置导航整页（div.jt-set-page）。h.apply 用来展开字段数组，保持 ES5 风格。
        var fields = [
          h("div", { className: "jt-field" },
            h("label", { htmlFor: "jira-tasks-base-url" }, "JIRA 地址"),
            h("input", {
              id: "jira-tasks-base-url",
              className: "jt-input",
              value: baseValue,
              placeholder: "http://jira.example.com/",
              disabled: !writable || busy,
              onChange: function (e) { setBaseEdit(e.target.value); },
              onKeyDown: function (e) { if (e.key === "Enter") save(); }
            })
          ),
          h("div", { className: "jt-field" },
            h("label", { htmlFor: "jira-tasks-username" }, "用户名 / 邮箱"),
            h("input", {
              id: "jira-tasks-username",
              className: "jt-input",
              value: usernameValue,
              placeholder: "alice@example.com",
              disabled: !writable || busy,
              onChange: function (e) { setUsernameEdit(e.target.value); },
              onKeyDown: function (e) { if (e.key === "Enter") save(); }
            })
          ),
          h("div", { className: "jt-field" },
            h("label", { htmlFor: "jira-tasks-password" }, "密码"),
            h("input", {
              id: "jira-tasks-password",
              className: "jt-input",
              type: "password",
              // 只写不读：这里永远是本次输入的草稿，绝不是已保存的密码。
              value: passwordDraft,
              placeholder: passwordOverridden
                ? "已保存，留空保持不变"
                : (envPasswordRef ? "填写以覆盖环境变量" : (passwordInfo && passwordInfo.configured ? "已配置，留空保持不变" : "输入密码")),
              autoComplete: "off",
              disabled: busy || !passwordWritable,
              onChange: function (e) { setPasswordDraft(e.target.value); },
              onKeyDown: function (e) { if (e.key === "Enter") save(); }
            })
          ),
          h("div", { className: "jt-hint", style: { margin: "-4px 0 8px" } }, passwordHint),
          h("div", { className: "jt-field" },
            h("label", { htmlFor: "jira-tasks-token" }, "访问令牌 / PAT（Bearer）"),
            h("input", {
              id: "jira-tasks-token",
              className: "jt-input",
              type: "password",
              value: tokenDraft,
              placeholder: tokenOverridden ? "已保存，留空保持不变" : (envTokenRef ? "填写以覆盖环境变量" : (tokenInfo && tokenInfo.configured ? "已配置，留空保持不变" : "粘贴令牌")),
              autoComplete: "off",
              disabled: busy || !tokenWritable,
              onChange: function (e) { setTokenDraft(e.target.value); },
              onKeyDown: function (e) { if (e.key === "Enter") save(); }
            })
          ),
          h("div", { className: "jt-hint", style: { marginBottom: "8px" } }, tokenHint),
          (tokenOverridden && tokenWritable) || (passwordOverridden && passwordWritable) || storedUsername.trim()
            ? h("div", { className: "jt-hint", style: { margin: "-4px 0 8px" } },
              h("button", {
                className: "jt-linklike",
                disabled: busy,
                title: "清除设置页保存的值（令牌 / 密码 / 用户名），改用环境变量",
                onClick: clearOverride
              }, "清除设置页保存值（回退到环境变量）"))
            : null,
          h("div", { className: "jt-probe", role: "status" },
            h("span", { className: dotClass, "aria-hidden": "true" }),
            h("span", null, probe.message || "未测试")
          ),
          h("div", { className: "jt-hint", style: { margin: "-4px 0 8px" } }, authModeText),
          failed ? h("div", { className: "jt-error", style: { marginBottom: "8px" } }, "保存失败：" + failed) : null,
          h("div", { className: "jt-buttons" },
            h("button", {
              className: "jt-btn",
              style: { marginRight: "auto" },
              disabled: busy || probe.phase === "testing",
              title: "用当前填写的内容测试 JIRA 地址与账号密码 / 令牌",
              // 草稿值只用于本次探测，不落盘；密码原样传（不 trim）。
              onClick: function () {
                runProbe({
                  baseUrl: baseValue,
                  token: (tokenDraft || "").trim(),
                  username: usernameValue,
                  password: passwordDraft || ""
                });
              }
            }, probe.phase === "testing" ? "测试中…" : "测试连接"),
            h("button", { className: "jt-btn", disabled: !dirty || busy, onClick: discard }, "放弃"),
            h("button", {
              className: "jt-btn jt-btn-primary",
              disabled: !dirty || busy
                || (baseDirty && !writable) || (usernameDirty && !writable)
                || (tokenDirty && !tokenWritable) || (passwordDirty && !passwordWritable),
              onClick: save
            }, busy ? "保存中…" : "保存")
          )
        ];

        if (asPage) {
          return h("div", { className: "jt-set-page" },
            h("h2", { className: "jt-page-title" }, "JIRA 配置"),
            h("p", { className: "jt-page-intro" }, "JIRA 地址、账号与访问令牌。账号密码与令牌都写入凭据存储，不回传前端；用户名写入配置（明文，仅用于显示当前账号）。项目 Key / JQL 仍按工作区在会话面板的 ⚙ 中配置。"),
            h.apply(null, ["div", { className: "jt-set-form" }].concat(fields))
          );
        }

        return h.apply(null, ["li", { className: "jt-set-card" },
          h("div", { className: "jt-set-head" },
            h("span", { className: "jt-set-title" }, "JIRA"),
            h("span", { className: "jt-set-desc" }, "JIRA 地址、账号与访问令牌；账号密码优先于令牌。项目 Key / JQL 仍按工作区在会话面板的 ⚙ 中配置。")
          )
        ].concat(fields));
      }

      // 槽位组件：摘要位只回一行文字，详情位挂载真正的表单（不调用任何 hook）。
      function JiraSettingsCard(props) {
        if (props && props.view === "summary") return "JIRA 地址、账号 / 令牌与连接状态";
        return h(JiraSettingsPage, null);
      }

      // 设置对话框左侧导航的一项（settings.section）：整页形态的同一个表单。
      function JiraSettingsSection() {
        return h(JiraSettingsPage, { variant: "page" });
      }

      return { card: JiraSettingsCard, section: JiraSettingsSection };
    }

    function apply(ctx) {
      pluginCtx = ctx;
      // ctx.effect(cb) 会立即执行 cb 并把其返回值作为卸载时的清理函数，
      // 所以样式注入必须放在回调内、返回移除函数，否则标签刚插入就被删除。
      ctx.effect(function () {
        var styleTag = document.createElement("style");
        styleTag.textContent = CSS + STATS_CSS + DETAIL_CSS;
        document.head.appendChild(styleTag);
        return function () { try { styleTag.remove(); } catch (e) {} };
      }, "jira-tasks: styles");
      var slots = ctx.get("slots");
      if (!slots) return;
      // 只注册 conversation.input.dock 一处。
      //
      // 为什么不用 conversation.composer.dock：该槽位在 DSH 0.1.7 里渲染进
      // InputBar 的 .dock 行——一个 justify-content:center 的**横向** flex 行，
      // 与右侧的上下文占用环（ContextMeter）并排。整宽任务面板放进那一行，会和
      // 占用环抢同一条 flex line，面板右侧内容被环压住。
      //
      // conversation.input.dock 属于 composerStack（flex-direction:column），
      // 在新会话与活跃会话下都会渲染（只要有 session + input），是整宽纵向行；
      // 面板自身用 CSS order:99 排到输入卡之后，即“输入框下方”。
      slots.inject("conversation.input.dock", function () {
        return slots.register({ name: "conversation.input.dock", id: "jira-open-tasks", order: 10 }, JiraTasksDock);
      });

      // 左侧栏入口 + 统计面板（DSH 0.2.0 的全局面板机制）：
      //   sidebar.panellist —— 左侧栏图标行，id 同时是 main 面板的 key；
      //   main（keyed）     —— 点图标后在中央列渲染整页任务统计。
      // 两处都包在 slots.inject 里：侧栏/布局包没就绪时不报错，就绪后自动挂上。
      ctx.effect(function () {
        return slots.inject("sidebar.panellist", function () {
          return slots.register({
            name: "sidebar.panellist",
            id: STATS_PANEL_ID,
            order: 30,
            label: "JIRA 统计"
          }, JiraStatsIcon);
        });
      }, "jira-tasks: stats sidebar entry");
      ctx.effect(function () {
        return slots.inject("main", function () {
          return slots.register({ name: "main", key: STATS_PANEL_ID }, JiraStatsPanel);
        });
      }, "jira-tasks: stats panel");

      // 工单详情页：和「JIRA 统计」同级的 main 中央面板。
      // 用宿主原生的 main 面板机制，而不是浮层——浮层在输入框区域里会被祖先的
      // overflow/transform 影响，试了两版都不稳。layout.selectPanel(null) 就是
      // 宿主原生的「回到对话」。
      ctx.effect(function () {
        return slots.inject("main", function () {
          return slots.register({ name: "main", key: ISSUE_PANEL_ID }, JiraIssuePage);
        });
      }, "jira-tasks: issue panel");

      // 设置表单的两处注册。DSH 0.1.5+ ：设置表单的服务是 configForms，命名空间就是
      // 本插件的 profile 条目 id（jira-tasks）；两处都只在宿主确实提供了该命名空间
      // 时才出现（whileServed 的 disposer 交回各自的 effect）。
      //
      // 1) 插件面板卡片（plugins.item）：插件自己的配置项，原来就在这里。
      // 2) 设置对话框左侧导航项（settings.section）：id/order/label 是导航身份，
      //    order 大于 Agent 预设（20），所以排在它下面；label 直接给字符串
      //    （槽位用 resolveSlotLabel 读，字符串与 thunk 都接受）。未知 id 由设置
      //    外壳回退到默认齿轮图标，无需注册图标。
      var configForms = ctx.get("configForms");
      var remote = ctx.get("remote");
      if (configForms && remote && remote.credentials) {
        var surfaces = createJiraSettingsSurfaces(configForms.get(SETTINGS_NS), remote.credentials);
        ctx.effect(function () {
          return configForms.whileServed([SETTINGS_NS], function () {
            return slots.inject("plugins.item", function () {
              return slots.register({ name: "plugins.item", id: SETTINGS_NS, order: 41, label: "JIRA" }, surfaces.card);
            });
          });
        }, "jira-tasks: plugins page card");
        ctx.effect(function () {
          return configForms.whileServed([SETTINGS_NS], function () {
            return slots.inject("settings.section", function () {
              return slots.register({ name: "settings.section", id: SETTINGS_NS, order: 30, label: "JIRA 配置" }, surfaces.section);
            });
          });
        }, "jira-tasks: settings section");
      }
    }

    exports.inject = ["slots", "configForms", "remote", "remote.credentials"];
    exports.apply = apply;
    return module.exports;
  }
});
