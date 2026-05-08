(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/sign-out-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SignOutButton",
    ()=>SignOutButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
'use client';
;
;
function SignOutButton() {
    const handleSignOut = async ()=>{
        try {
            const csrfRes = await fetch('/api/auth/csrf');
            const { csrfToken } = await csrfRes.json();
            await fetch('/api/auth/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `csrfToken=${csrfToken}`
            });
        } catch (e) {}
        window.location.href = '/login';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: handleSignOut,
        className: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 w-full transition-colors",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                className: "w-5 h-5"
            }, void 0, false, {
                fileName: "[project]/components/sign-out-button.tsx",
                lineNumber: 24,
                columnNumber: 13
            }, this),
            "Çıkış Yap"
        ]
    }, void 0, true, {
        fileName: "[project]/components/sign-out-button.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
_c = SignOutButton;
var _c;
__turbopack_context__.k.register(_c, "SignOutButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/actions/data:c243c8 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "switchTenant",
    ()=>$$RSC_SERVER_ACTION_0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40ae5b4664256002376426b8c2a4c09ed964448bd7":"switchTenant"},"lib/actions/tenant.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40ae5b4664256002376426b8c2a4c09ed964448bd7", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "switchTenant");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vdGVuYW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc2VydmVyJztcblxuaW1wb3J0IHsgY29va2llcyB9IGZyb20gJ25leHQvaGVhZGVycyc7XG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gJ25leHQvbmF2aWdhdGlvbic7XG5pbXBvcnQgeyBkYiB9IGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgdGVuYW50cywgdXNlcnMsIHRlbmFudFVzZXJzIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuaW1wb3J0IHsgYXV0aCB9IGZyb20gXCJAL2F1dGhcIjtcbmltcG9ydCB7IGVxIH0gZnJvbSBcImRyaXp6bGUtb3JtXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzd2l0Y2hUZW5hbnQodGVuYW50SWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGNvb2tpZVN0b3JlID0gYXdhaXQgY29va2llcygpO1xuICAgIGNvb2tpZVN0b3JlLnNldCgnZGVybmVrdGVfdGVuYW50X2lkJywgdGVuYW50SWQsIHtcbiAgICAgICAgcGF0aDogJy8nLFxuICAgICAgICBtYXhBZ2U6IDYwICogNjAgKiAyNCAqIDMwLCAvLyAzMCBkYXlzXG4gICAgICAgIGh0dHBPbmx5OiB0cnVlLFxuICAgICAgICBzYW1lU2l0ZTogJ2xheCdcbiAgICB9KTtcblxuICAgIC8vIFJlZGlyZWN0IHRvIGRhc2hib2FyZCB0byByZWZyZXNoIGNvbnRleHRcbiAgICByZWRpcmVjdCgnL2Rhc2hib2FyZC9ob21lJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVUZW5hbnQoZGF0YTogeyBzaG9ydE5hbWU6IHN0cmluZywgbG9uZ05hbWU6IHN0cmluZywgcHJpbWFyeUNvbG9yOiBzdHJpbmcsIHdlYnNpdGVVcmw/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBhdXRoKCk7XG4gICAgaWYgKCFzZXNzaW9uPy51c2VyPy5pc0FwcGxpY2F0aW9uQWRtaW4pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hdXRob3JpemVkXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IFtuZXdUZW5hbnRdID0gYXdhaXQgZGIuaW5zZXJ0KHRlbmFudHMpLnZhbHVlcyh7XG4gICAgICAgIHNob3J0TmFtZTogZGF0YS5zaG9ydE5hbWUsXG4gICAgICAgIGxvbmdOYW1lOiBkYXRhLmxvbmdOYW1lLFxuICAgICAgICBwcmltYXJ5Q29sb3I6IGRhdGEucHJpbWFyeUNvbG9yIHx8ICcjMjU2M0VCJyxcbiAgICAgICAgd2Vic2l0ZVVybDogZGF0YS53ZWJzaXRlVXJsIHx8IG51bGwsXG4gICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgIH0pLnJldHVybmluZyh7IGlkOiB0ZW5hbnRzLmlkIH0pO1xuXG4gICAgLy8gVHJ5IHRvIGZpbmQgc3VwZXJhZG1pbkBiYi5jb21cbiAgICBsZXQgc3VwZXJBZG1pbiA9IGF3YWl0IGRiLnF1ZXJ5LnVzZXJzLmZpbmRGaXJzdCh7XG4gICAgICAgIHdoZXJlOiBlcSh1c2Vycy5lbWFpbCwgJ3N1cGVyYWRtaW5AYmIuY29tJylcbiAgICB9KTtcblxuICAgIGlmICghc3VwZXJBZG1pbikge1xuICAgICAgICAvLyBGaW5kIGFkbWluQGJiLmNvbSB0byBjb3B5IHBhc3N3b3JkXG4gICAgICAgIGNvbnN0IGFkbWluVXNlciA9IGF3YWl0IGRiLnF1ZXJ5LnVzZXJzLmZpbmRGaXJzdCh7XG4gICAgICAgICAgICB3aGVyZTogZXEodXNlcnMuZW1haWwsICdhZG1pbkBiYi5jb20nKVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBbbmV3VXNlcl0gPSBhd2FpdCBkYi5pbnNlcnQodXNlcnMpLnZhbHVlcyh7XG4gICAgICAgICAgICBmdWxsTmFtZTogXCJWYWvEsWYgWcO2bmV0aWNpc2lcIixcbiAgICAgICAgICAgIGVtYWlsOiBcInN1cGVyYWRtaW5AYmIuY29tXCIsXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogXCI1NTU5OTk4ODc3XCIsIC8vIFVuaXF1ZSBkdW1teSBwaG9uZVxuICAgICAgICAgICAgcGFzc3dvcmQ6IGFkbWluVXNlcj8ucGFzc3dvcmQgfHwgXCJcIiwgLy8gQ29weSBoYXNoXG4gICAgICAgICAgICBpc0FwcGxpY2F0aW9uQWRtaW46IGZhbHNlLFxuICAgICAgICB9KS5yZXR1cm5pbmcoeyBpZDogdXNlcnMuaWQgfSk7XG4gICAgICAgIFxuICAgICAgICBzdXBlckFkbWluID0gbmV3VXNlciBhcyBhbnk7XG4gICAgfVxuXG4gICAgLy8gTGluayB1c2VyIHRvIG5ldyB0ZW5hbnRcbiAgICBhd2FpdCBkYi5pbnNlcnQodGVuYW50VXNlcnMpLnZhbHVlcyh7XG4gICAgICAgIHRlbmFudElkOiBuZXdUZW5hbnQuaWQsXG4gICAgICAgIHVzZXJJZDogc3VwZXJBZG1pbi5pZCxcbiAgICAgICAgcm9sZTogJ2FkbWluJyxcbiAgICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVUZW5hbnRTdGF0dXModGVuYW50SWQ6IHN0cmluZywgaXNBY3RpdmU6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgYXV0aCgpO1xuICAgIGlmICghc2Vzc2lvbj8udXNlcj8uaXNBcHBsaWNhdGlvbkFkbWluKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYXV0aG9yaXplZFwiKTtcbiAgICB9XG5cbiAgICBhd2FpdCBkYi51cGRhdGUodGVuYW50cylcbiAgICAgICAgLnNldCh7IGlzQWN0aXZlIH0pXG4gICAgICAgIC53aGVyZShlcSh0ZW5hbnRzLmlkLCB0ZW5hbnRJZCkpO1xuICAgICAgICBcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6InNSQVNzQix5TEFBQSJ9
}),
"[project]/components/tenant-switcher.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantSwitcher",
    ()=>TenantSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$c243c8__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/actions/data:c243c8 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUpDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-up-down.js [app-client] (ecmascript) <export default as ChevronsUpDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function TenantSwitcher({ currentTenant, availableTenants }) {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (availableTenants.length <= 1) {
        return null;
    }
    const handleSwitch = async (tenantId)=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$c243c8__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["switchTenant"])(tenantId);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to switch tenant:", error);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400 transition-colors",
                title: "Dernek Değiştir",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUpDown$3e$__["ChevronsUpDown"], {
                    className: "w-5 h-5"
                }, void 0, false, {
                    fileName: "[project]/components/tenant-switcher.tsx",
                    lineNumber: 42,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/tenant-switcher.tsx",
                lineNumber: 37,
                columnNumber: 13
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-10",
                        onClick: ()=>setIsOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/tenant-switcher.tsx",
                        lineNumber: 47,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 z-20 py-1",
                        children: availableTenants.map((tenant)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleSwitch(tenant.id),
                                className: "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: tenant.shortName
                                    }, void 0, false, {
                                        fileName: "[project]/components/tenant-switcher.tsx",
                                        lineNumber: 58,
                                        columnNumber: 33
                                    }, this),
                                    currentTenant.id === tenant.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                        className: "w-4 h-4 text-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/components/tenant-switcher.tsx",
                                        lineNumber: 60,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, tenant.id, true, {
                                fileName: "[project]/components/tenant-switcher.tsx",
                                lineNumber: 53,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/tenant-switcher.tsx",
                        lineNumber: 51,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tenant-switcher.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
_s(TenantSwitcher, "+sus0Lb0ewKHdwiUhiTAJFoFyQ0=");
_c = TenantSwitcher;
var _c;
__turbopack_context__.k.register(_c, "TenantSwitcher");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/force-password-check.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForcePasswordCheck",
    ()=>ForcePasswordCheck
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ForcePasswordCheck({ forcePasswordChange }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForcePasswordCheck.useEffect": ()=>{
            if (forcePasswordChange) {
                // If user MUST change password, strictly keep them on the change-password page
                if (pathname !== '/dashboard/change-password') {
                    router.push('/dashboard/change-password');
                }
            }
        }
    }["ForcePasswordCheck.useEffect"], [
        forcePasswordChange,
        pathname,
        router
    ]);
    return null;
}
_s(ForcePasswordCheck, "o5ZI+SkIudo7k8HXWSgHRZPlXUg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = ForcePasswordCheck;
var _c;
__turbopack_context__.k.register(_c, "ForcePasswordCheck");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/actions/data:c55e04 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signContract",
    ()=>$$RSC_SERVER_ACTION_1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"60d9e83d263cb8db8c8c1037a027b60588bc6a09bb":"signContract"},"lib/actions/agreements.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60d9e83d263cb8db8c8c1037a027b60588bc6a09bb", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "signContract");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWdyZWVtZW50cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgZGIgfSBmcm9tIFwiQC9saWIvZGJcIjtcbmltcG9ydCB7IGNvbnRyYWN0cywgdXNlckNvbnRyYWN0cyB9IGZyb20gXCJAL2xpYi9kYi9zY2hlbWFcIjtcbmltcG9ydCB7IGVxLCBhbmQgfSBmcm9tIFwiZHJpenpsZS1vcm1cIjtcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSBcIm5leHQvY2FjaGVcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE1pc3NpbmdDb250cmFjdHModXNlcklkOiBzdHJpbmcpIHtcbiAgICAvLyBUw7xtIGFrdGlmIChnw7xuY2VsIHZlcnNpeW9uKSBzaXN0ZW0gc8O2emxlxZ9tZWxlcmlcbiAgICBjb25zdCBhY3RpdmVDb250cmFjdHNMaXN0ID0gYXdhaXQgZGIucXVlcnkuY29udHJhY3RzLmZpbmRNYW55KHtcbiAgICAgICAgd2hlcmU6IGVxKGNvbnRyYWN0cy5pc0FjdGl2ZSwgdHJ1ZSlcbiAgICB9KTtcblxuICAgIGlmIChhY3RpdmVDb250cmFjdHNMaXN0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdOyAvLyBDaGVjayBpZiBzeXN0ZW0gaGFzIG5vIGNvbnRyYWN0c1xuXG4gICAgY29uc3Qgc2lnbmVkTGlzdCA9IGF3YWl0IGRiLnF1ZXJ5LnVzZXJDb250cmFjdHMuZmluZE1hbnkoe1xuICAgICAgICB3aGVyZTogZXEodXNlckNvbnRyYWN0cy51c2VySWQsIHVzZXJJZClcbiAgICB9KTtcblxuICAgIGNvbnN0IHNpZ25lZENvbnRyYWN0SWRzID0gbmV3IFNldChzaWduZWRMaXN0Lm1hcChzID0+IHMuY29udHJhY3RJZCkpO1xuXG4gICAgLy8gU2lnbiBlZGlsbWVtacWfIG9sYW5sYXLEsSBkw7ZuZMO8clxuICAgIHJldHVybiBhY3RpdmVDb250cmFjdHNMaXN0LmZpbHRlcihjID0+ICFzaWduZWRDb250cmFjdElkcy5oYXMoYy5pZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnbkNvbnRyYWN0KHVzZXJJZDogc3RyaW5nLCBjb250cmFjdElkOiBzdHJpbmcpIHtcbiAgICBpZiAoIXVzZXJJZCB8fCAhY29udHJhY3RJZCkgdGhyb3cgbmV3IEVycm9yKFwiRWtzaWsgYmlsZ2khXCIpO1xuXG4gICAgYXdhaXQgZGIuaW5zZXJ0KHVzZXJDb250cmFjdHMpLnZhbHVlcyh7XG4gICAgICAgIHVzZXJJZCxcbiAgICAgICAgY29udHJhY3RJZCxcbiAgICAgICAgYWNjZXB0ZWRBdDogbmV3IERhdGUoKSxcbiAgICB9KTtcblxuICAgIHJldmFsaWRhdGVQYXRoKFwiL2Rhc2hib2FyZFwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFkbWluQ29udHJhY3RzKCkge1xuICAgIHJldHVybiBhd2FpdCBkYi5xdWVyeS5jb250cmFjdHMuZmluZE1hbnkoe1xuICAgICAgICBvcmRlckJ5OiAoY29udHJhY3RzLCB7IGRlc2MgfSkgPT4gW2Rlc2MoY29udHJhY3RzLmNyZWF0ZWRBdCldXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVDb250cmFjdFZlcnNpb24oZGF0YTogeyB0aXRsZTogc3RyaW5nLCB0eXBlOiBhbnksIHZlcnNpb246IHN0cmluZywgY29udGVudDogc3RyaW5nIH0pIHtcbiAgICAvLyBBeW7EsSB0aXB0ZWtpIGVza2kgc8O2emxlxZ9tZWxlcmkgZGVha3RpZiBldFxuICAgIGF3YWl0IGRiLnVwZGF0ZShjb250cmFjdHMpXG4gICAgICAgIC5zZXQoeyBpc0FjdGl2ZTogZmFsc2UgfSlcbiAgICAgICAgLndoZXJlKGVxKGNvbnRyYWN0cy50eXBlLCBkYXRhLnR5cGUpKTtcblxuICAgIC8vIFllbmlzaW5pIGVrbGVcbiAgICBhd2FpdCBkYi5pbnNlcnQoY29udHJhY3RzKS52YWx1ZXMoe1xuICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICB2ZXJzaW9uOiBkYXRhLnZlcnNpb24sXG4gICAgICAgIGNvbnRlbnQ6IGRhdGEuY29udGVudCxcbiAgICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXZhbGlkYXRlUGF0aChcIi9kYXNoYm9hcmQvYWRtaW4vYWdyZWVtZW50c1wiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNpZ25lZENvbnRyYWN0cyh1c2VySWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHsgZGVzYyB9ID0gYXdhaXQgaW1wb3J0KFwiZHJpenpsZS1vcm1cIik7XG4gICAgLy8gR2V0IGFsbCB1c2VyQ29udHJhY3RzIGZvciB0aGlzIHVzZXIsIGpvaW5lZCB3aXRoIGNvbnRyYWN0cyB0YWJsZVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLnNlbGVjdCh7XG4gICAgICAgIGlkOiBjb250cmFjdHMuaWQsXG4gICAgICAgIHR5cGU6IGNvbnRyYWN0cy50eXBlLFxuICAgICAgICB2ZXJzaW9uOiBjb250cmFjdHMudmVyc2lvbixcbiAgICAgICAgdGl0bGU6IGNvbnRyYWN0cy50aXRsZSxcbiAgICAgICAgY29udGVudDogY29udHJhY3RzLmNvbnRlbnQsXG4gICAgICAgIGFjY2VwdGVkQXQ6IHVzZXJDb250cmFjdHMuYWNjZXB0ZWRBdFxuICAgIH0pLmZyb20odXNlckNvbnRyYWN0cylcbiAgICAgICAgLmlubmVySm9pbihjb250cmFjdHMsIGVxKHVzZXJDb250cmFjdHMuY29udHJhY3RJZCwgY29udHJhY3RzLmlkKSlcbiAgICAgICAgLndoZXJlKGVxKHVzZXJDb250cmFjdHMudXNlcklkLCB1c2VySWQpKVxuICAgICAgICAub3JkZXJCeShkZXNjKHVzZXJDb250cmFjdHMuYWNjZXB0ZWRBdCkpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMFJBeUJzQix5TEFBQSJ9
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "maskFullName",
    ()=>maskFullName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function maskFullName(fullName) {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts.map((part)=>part[0]?.toUpperCase() + ".").join("");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 46,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/force-contract-signature.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForceContractSignature",
    ()=>ForceContractSignature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$c55e04__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/actions/data:c55e04 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ForceContractSignature({ userId, pendingContracts }) {
    _s();
    const [initialTotal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(pendingContracts?.length || 0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!pendingContracts || pendingContracts.length === 0) return null;
    const currentContract = pendingContracts[0];
    const currentIndex = initialTotal - pendingContracts.length;
    // Determine type label
    const getTypeLabel = (type)=>{
        switch(type){
            case 'KVKK':
                return "KVKK ve Veri Politikası";
            case 'USER_AGREEMENT':
                return "Kullanıcı Sözleşmesi";
            case 'STUDENT_AGREEMENT':
                return "Aday/Bursiyer Taahhütnamesi";
            default:
                return "Sözleşme / Metin";
        }
    };
    const handleAccept = async ()=>{
        setLoading(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$c55e04__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["signContract"])(userId, currentContract.id);
        // "signContract" backendde revalidatePath çağırır, pendingContracts arrayi 1 eksilip yeniden gelir.
        // Bu sebeple bizim ekstra currentIndex artırmamıza gerek kalmaz.
        } catch (error) {
            console.error("Onaylama hatası:", error);
            alert("Sözleşme onaylanırken bir hata oluştu.");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full flex-col flex items-center justify-center p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "mb-6 text-center flex flex-col items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-yellow-100 p-3 rounded-full mb-3 text-yellow-600",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                            className: "w-8 h-8"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                            lineNumber: 51,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400",
                        children: "Güncel Sözleşme Onayı Gerekiyor"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                        lineNumber: 53,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 max-w-md mt-2 text-sm",
                        children: [
                            "Devam edebilmek için sistemde yenilenmiş veya yeni eklenmiş olan sözleşmeleri onaylamanız gerekmektedir. (",
                            pendingContracts.length,
                            " Onay Bekliyor)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                        lineNumber: 56,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                lineNumber: 49,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col max-h-[80vh]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-b border-gray-200 dark:border-zinc-800 pb-4 mb-4 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2",
                                        children: [
                                            currentIndex + 1,
                                            ". ",
                                            getTypeLabel(currentContract.type)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                                        lineNumber: 65,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-500 mt-1",
                                        children: [
                                            currentContract.title,
                                            " (v",
                                            currentContract.version,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                                        lineNumber: 68,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                                lineNumber: 64,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500",
                                children: [
                                    currentIndex + 1,
                                    " / ",
                                    initialTotal
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg border border-gray-100 dark:border-zinc-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed",
                        children: currentContract.content
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                        lineNumber: 75,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleAccept,
                            disabled: loading,
                            className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95",
                            children: loading ? "Onaylanıyor..." : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                                        lineNumber: 87,
                                        columnNumber: 33
                                    }, this),
                                    "Okudum ve Kabul Ediyorum"
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                            lineNumber: 80,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                        lineNumber: 79,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/force-contract-signature.tsx",
                lineNumber: 62,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/force-contract-signature.tsx",
        lineNumber: 48,
        columnNumber: 9
    }, this);
}
_s(ForceContractSignature, "Il574dMAOsU29Y6Z4xI83if8BUY=");
_c = ForceContractSignature;
var _c;
__turbopack_context__.k.register(_c, "ForceContractSignature");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/contract-enforcer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContractEnforcer",
    ()=>ContractEnforcer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$force$2d$contract$2d$signature$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/dashboard/force-contract-signature.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ContractEnforcer({ userId, pendingContracts }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    // If there is nothing to sign, quietly do nothing
    if (!pendingContracts || pendingContracts.length === 0) {
        return null;
    }
    // Exempt the Admin Agreement Management screen so the admin 
    // doesn't immediately get trapped after creating a new contract version
    if (pathname === "/dashboard/admin/agreements") {
        return null;
    }
    // Trapped! Massive unclosable full screen view
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$force$2d$contract$2d$signature$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForceContractSignature"], {
            userId: userId,
            pendingContracts: pendingContracts
        }, void 0, false, {
            fileName: "[project]/app/dashboard/contract-enforcer.tsx",
            lineNumber: 29,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/dashboard/contract-enforcer.tsx",
        lineNumber: 28,
        columnNumber: 9
    }, this);
}
_s(ContractEnforcer, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = ContractEnforcer;
var _c;
__turbopack_context__.k.register(_c, "ContractEnforcer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/collapsible-nav-section.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CollapsibleNavSection",
    ()=>CollapsibleNavSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function CollapsibleNavSection({ title, storageKey, children, defaultExpanded = true }) {
    _s();
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isExpanded, setIsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultExpanded);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CollapsibleNavSection.useEffect": ()=>{
            setIsMounted(true);
            const stored = localStorage.getItem(`nav-section-${storageKey}`);
            if (stored !== null) {
                setIsExpanded(stored === "true");
            }
        }
    }["CollapsibleNavSection.useEffect"], [
        storageKey
    ]);
    const toggle = ()=>{
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(`nav-section-${storageKey}`, String(newState));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-2 mt-4 first:mt-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: toggle,
                className: "w-full flex items-center justify-between bg-white/10 text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-white/20 cursor-pointer",
                "aria-expanded": isExpanded,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                        lineNumber: 41,
                        columnNumber: 17
                    }, this),
                    isMounted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: `w-3 h-3 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`
                    }, void 0, false, {
                        fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                        lineNumber: 43,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: `w-3 h-3 ${isExpanded ? "" : "-rotate-90"}`
                    }, void 0, false, {
                        fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                        lineNumber: 48,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 space-y-1",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                        lineNumber: 59,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                    lineNumber: 58,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/collapsible-nav-section.tsx",
                lineNumber: 54,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/collapsible-nav-section.tsx",
        lineNumber: 35,
        columnNumber: 9
    }, this);
}
_s(CollapsibleNavSection, "XzBVCZcJaNzWyK4ro0scyhvdS2A=");
_c = CollapsibleNavSection;
var _c;
__turbopack_context__.k.register(_c, "CollapsibleNavSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/actions/data:598fcf [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNotifications",
    ()=>$$RSC_SERVER_ACTION_1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"709f8330aff7a508586a31bc07742da017e28e0cce":"getNotifications"},"lib/actions/notification.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("709f8330aff7a508586a31bc07742da017e28e0cce", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "getNotifications");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vbm90aWZpY2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHNlcnZlclwiO1xuXG5pbXBvcnQgeyBkYiB9IGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgbm90aWZpY2F0aW9ucywgdXNlck5vdGlmaWNhdGlvblNldHRpbmdzIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuaW1wb3J0IHsgZXEsIGFuZCwgaW5BcnJheSwgZGVzYywgY291bnQgfSBmcm9tIFwiZHJpenpsZS1vcm1cIjtcbmltcG9ydCB3ZWJwdXNoIGZyb20gJ3dlYi1wdXNoJztcbmltcG9ydCB7IHB1c2hTdWJzY3JpcHRpb25zIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuXG53ZWJwdXNoLnNldFZhcGlkRGV0YWlscyhcbiAgICAnbWFpbHRvOmluZm9AZGVybmVrdGVidWd1bi5jb20nLFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1ZBUElEX1BVQkxJQ19LRVkgYXMgc3RyaW5nLFxuICAgIHByb2Nlc3MuZW52LlZBUElEX1BSSVZBVEVfS0VZIGFzIHN0cmluZ1xuKTtcblxuZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uVHlwZSA9ICdwYXltZW50JyB8ICdhcHBsaWNhdGlvbicgfCAncmVmZXJlbmNlJyB8ICdzeXN0ZW0nO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKFxuICAgIHRlbmFudElkOiBzdHJpbmcsXG4gICAgdXNlcklkczogc3RyaW5nW10sXG4gICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZSxcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIGJvZHk6IHN0cmluZyxcbiAgICBhY3Rpb25Vcmw/OiBzdHJpbmdcbikge1xuICAgIGlmICghdXNlcklkcyB8fCB1c2VySWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgLy8gMS4gRmV0Y2ggc2V0dGluZ3MgdG8gZmlsdGVyIG91dCB1c2VycyB3aG8gb3B0ZWQgb3V0XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBkYi5zZWxlY3QoKS5mcm9tKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncylcbiAgICAgICAgLndoZXJlKFxuICAgICAgICAgICAgYW5kKFxuICAgICAgICAgICAgICAgIGVxKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGluQXJyYXkodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkcylcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgIGNvbnN0IHNldHRpbmdNYXAgPSBuZXcgTWFwKHNldHRpbmdzLm1hcChzID0+IFtzLnVzZXJJZCwgc10pKTtcblxuICAgIC8vIEZpbHRlciBhcnJheTogVXNlciB3YW50cyBpdCBpZjogbm8gc2V0dGluZyByb3cgZm91bmQgT1Igc2V0dGluZyByb3cgZm9yIHRoaXMgdHlwZSBpcyB0cnVlLlxuICAgIGNvbnN0IHVzZXJzVG9Ob3RpZnkgPSB1c2VySWRzLmZpbHRlcih1aWQgPT4ge1xuICAgICAgICBjb25zdCBzID0gc2V0dGluZ01hcC5nZXQodWlkKTtcbiAgICAgICAgaWYgKCFzKSByZXR1cm4gdHJ1ZTsgLy8gRGVmYXVsdCBpcyB0cnVlXG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdwYXltZW50JykgcmV0dXJuIHMubm90aWZ5UGF5bWVudHM7XG4gICAgICAgIGlmICh0eXBlID09PSAnYXBwbGljYXRpb24nKSByZXR1cm4gcy5ub3RpZnlBcHBsaWNhdGlvbnM7XG4gICAgICAgIGlmICh0eXBlID09PSAncmVmZXJlbmNlJykgcmV0dXJuIHMubm90aWZ5UmVmZXJlbmNlcztcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzeXN0ZW0nKSByZXR1cm4gcy5ub3RpZnlTeXN0ZW07XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAodXNlcnNUb05vdGlmeS5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIC8vIDIuIEluc2VydCBpbnRvIG5vdGlmaWNhdGlvbnNcbiAgICBjb25zdCB2YWx1ZXMgPSB1c2Vyc1RvTm90aWZ5Lm1hcCh1aWQgPT4gKHtcbiAgICAgICAgdGVuYW50SWQsXG4gICAgICAgIHVzZXJJZDogdWlkLFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgYm9keSxcbiAgICAgICAgYWN0aW9uVXJsOiBhY3Rpb25VcmwgfHwgbnVsbCxcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkYi5pbnNlcnQobm90aWZpY2F0aW9ucykudmFsdWVzKHZhbHVlcyk7XG5cbiAgICAgICAgLy8gMy4gV2ViIFB1c2ggVHJpZ2dlciBMb2dpY1xuICAgICAgICBjb25zdCBzdWJzID0gYXdhaXQgZGIucXVlcnkucHVzaFN1YnNjcmlwdGlvbnMuZmluZE1hbnkoe1xuICAgICAgICAgICAgd2hlcmU6IGluQXJyYXkocHVzaFN1YnNjcmlwdGlvbnMudXNlcklkLCB1c2Vyc1RvTm90aWZ5KVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3Vicy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgICAgdXJsOiBhY3Rpb25VcmwgfHwgJy9kYXNoYm9hcmQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKHN1YnMubWFwKHN1YiA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnQ6IHN1Yi5lbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAga2V5czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcDI1NmRoOiBzdWIucDI1NmRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aDogc3ViLmF1dGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlYnB1c2guc2VuZE5vdGlmaWNhdGlvbihwdXNoQ29uZmlnLCBwYXlsb2FkKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLnN0YXR1c0NvZGUgPT09IDQxMCB8fCBlcnIuc3RhdHVzQ29kZSA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGIuZGVsZXRlKHB1c2hTdWJzY3JpcHRpb25zKS53aGVyZShlcShwdXNoU3Vic2NyaXB0aW9ucy5pZCwgc3ViLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIldlYiBQdXNoIEVycm9yOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGluc2VydCBub3RpZmljYXRpb25zOlwiLCBlcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Tm90aWZpY2F0aW9ucyh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZywgbGltaXRDb3VudCA9IDIwKSB7XG4gICAgcmV0dXJuIGF3YWl0IGRiLnNlbGVjdCgpXG4gICAgICAgIC5mcm9tKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAub3JkZXJCeShkZXNjKG5vdGlmaWNhdGlvbnMuY3JlYXRlZEF0KSlcbiAgICAgICAgLmxpbWl0KGxpbWl0Q291bnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQodGVuYW50SWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoeyB2YWx1ZTogY291bnQoKSB9KVxuICAgICAgICAuZnJvbShub3RpZmljYXRpb25zKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMudXNlcklkLCB1c2VySWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMuaXNSZWFkLCBmYWxzZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0WzBdLnZhbHVlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya05vdGlmaWNhdGlvbkFzUmVhZChpZDogc3RyaW5nKSB7XG4gICAgYXdhaXQgZGIudXBkYXRlKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC5zZXQoeyBpc1JlYWQ6IHRydWUgfSlcbiAgICAgICAgLndoZXJlKGVxKG5vdGlmaWNhdGlvbnMuaWQsIGlkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrQWxsTm90aWZpY2F0aW9uc0FzUmVhZCh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykge1xuICAgIGF3YWl0IGRiLnVwZGF0ZShub3RpZmljYXRpb25zKVxuICAgICAgICAuc2V0KHsgaXNSZWFkOiB0cnVlIH0pXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy5pc1JlYWQsIGZhbHNlKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlck5vdGlmaWNhdGlvblNldHRpbmdzKHRlbmFudElkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZGIuc2VsZWN0KClcbiAgICAgICAgLmZyb20odXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkKVxuICAgICAgICAgICAgKVxuICAgICAgICApLmxpbWl0KDEpO1xuXG4gICAgaWYgKHJlcy5sZW5ndGggPiAwKSByZXR1cm4gcmVzWzBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbm90aWZ5UGF5bWVudHM6IHRydWUsXG4gICAgICAgIG5vdGlmeUFwcGxpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5UmVmZXJlbmNlczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5U3lzdGVtOiB0cnVlXG4gICAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVVc2VyTm90aWZpY2F0aW9uU2V0dGluZ3MoXG4gICAgdGVuYW50SWQ6IHN0cmluZyxcbiAgICB1c2VySWQ6IHN0cmluZyxcbiAgICBzZXR0aW5nc0RhdGE6IHsgbm90aWZ5UGF5bWVudHM6IGJvb2xlYW4sIG5vdGlmeUFwcGxpY2F0aW9uczogYm9vbGVhbiwgbm90aWZ5UmVmZXJlbmNlczogYm9vbGVhbiwgbm90aWZ5U3lzdGVtOiBib29sZWFuIH1cbikge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGIuc2VsZWN0KCkuZnJvbSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudGVuYW50SWQsIHRlbmFudElkKSxcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudXNlcklkLCB1c2VySWQpXG4gICAgICAgICAgICApXG4gICAgICAgICkubGltaXQoMSk7XG5cbiAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBhd2FpdCBkYi51cGRhdGUodXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAgICAgLnNldCh7XG4gICAgICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhLFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVyZShlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MuaWQsIGV4aXN0aW5nWzBdLmlkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZGIuaW5zZXJ0KHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncykudmFsdWVzKHtcbiAgICAgICAgICAgIHRlbmFudElkLFxuICAgICAgICAgICAgdXNlcklkLFxuICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiZ1NBbUdzQiw2TEFBQSJ9
}),
"[project]/lib/actions/data:4f4fec [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getUnreadNotificationCount",
    ()=>$$RSC_SERVER_ACTION_2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"6098d1cb9d8031cd3bbd17f0c9511b8483e09dbf6a":"getUnreadNotificationCount"},"lib/actions/notification.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("6098d1cb9d8031cd3bbd17f0c9511b8483e09dbf6a", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "getUnreadNotificationCount");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vbm90aWZpY2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHNlcnZlclwiO1xuXG5pbXBvcnQgeyBkYiB9IGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgbm90aWZpY2F0aW9ucywgdXNlck5vdGlmaWNhdGlvblNldHRpbmdzIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuaW1wb3J0IHsgZXEsIGFuZCwgaW5BcnJheSwgZGVzYywgY291bnQgfSBmcm9tIFwiZHJpenpsZS1vcm1cIjtcbmltcG9ydCB3ZWJwdXNoIGZyb20gJ3dlYi1wdXNoJztcbmltcG9ydCB7IHB1c2hTdWJzY3JpcHRpb25zIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuXG53ZWJwdXNoLnNldFZhcGlkRGV0YWlscyhcbiAgICAnbWFpbHRvOmluZm9AZGVybmVrdGVidWd1bi5jb20nLFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1ZBUElEX1BVQkxJQ19LRVkgYXMgc3RyaW5nLFxuICAgIHByb2Nlc3MuZW52LlZBUElEX1BSSVZBVEVfS0VZIGFzIHN0cmluZ1xuKTtcblxuZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uVHlwZSA9ICdwYXltZW50JyB8ICdhcHBsaWNhdGlvbicgfCAncmVmZXJlbmNlJyB8ICdzeXN0ZW0nO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKFxuICAgIHRlbmFudElkOiBzdHJpbmcsXG4gICAgdXNlcklkczogc3RyaW5nW10sXG4gICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZSxcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIGJvZHk6IHN0cmluZyxcbiAgICBhY3Rpb25Vcmw/OiBzdHJpbmdcbikge1xuICAgIGlmICghdXNlcklkcyB8fCB1c2VySWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgLy8gMS4gRmV0Y2ggc2V0dGluZ3MgdG8gZmlsdGVyIG91dCB1c2VycyB3aG8gb3B0ZWQgb3V0XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBkYi5zZWxlY3QoKS5mcm9tKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncylcbiAgICAgICAgLndoZXJlKFxuICAgICAgICAgICAgYW5kKFxuICAgICAgICAgICAgICAgIGVxKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGluQXJyYXkodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkcylcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgIGNvbnN0IHNldHRpbmdNYXAgPSBuZXcgTWFwKHNldHRpbmdzLm1hcChzID0+IFtzLnVzZXJJZCwgc10pKTtcblxuICAgIC8vIEZpbHRlciBhcnJheTogVXNlciB3YW50cyBpdCBpZjogbm8gc2V0dGluZyByb3cgZm91bmQgT1Igc2V0dGluZyByb3cgZm9yIHRoaXMgdHlwZSBpcyB0cnVlLlxuICAgIGNvbnN0IHVzZXJzVG9Ob3RpZnkgPSB1c2VySWRzLmZpbHRlcih1aWQgPT4ge1xuICAgICAgICBjb25zdCBzID0gc2V0dGluZ01hcC5nZXQodWlkKTtcbiAgICAgICAgaWYgKCFzKSByZXR1cm4gdHJ1ZTsgLy8gRGVmYXVsdCBpcyB0cnVlXG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdwYXltZW50JykgcmV0dXJuIHMubm90aWZ5UGF5bWVudHM7XG4gICAgICAgIGlmICh0eXBlID09PSAnYXBwbGljYXRpb24nKSByZXR1cm4gcy5ub3RpZnlBcHBsaWNhdGlvbnM7XG4gICAgICAgIGlmICh0eXBlID09PSAncmVmZXJlbmNlJykgcmV0dXJuIHMubm90aWZ5UmVmZXJlbmNlcztcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzeXN0ZW0nKSByZXR1cm4gcy5ub3RpZnlTeXN0ZW07XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAodXNlcnNUb05vdGlmeS5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIC8vIDIuIEluc2VydCBpbnRvIG5vdGlmaWNhdGlvbnNcbiAgICBjb25zdCB2YWx1ZXMgPSB1c2Vyc1RvTm90aWZ5Lm1hcCh1aWQgPT4gKHtcbiAgICAgICAgdGVuYW50SWQsXG4gICAgICAgIHVzZXJJZDogdWlkLFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgYm9keSxcbiAgICAgICAgYWN0aW9uVXJsOiBhY3Rpb25VcmwgfHwgbnVsbCxcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkYi5pbnNlcnQobm90aWZpY2F0aW9ucykudmFsdWVzKHZhbHVlcyk7XG5cbiAgICAgICAgLy8gMy4gV2ViIFB1c2ggVHJpZ2dlciBMb2dpY1xuICAgICAgICBjb25zdCBzdWJzID0gYXdhaXQgZGIucXVlcnkucHVzaFN1YnNjcmlwdGlvbnMuZmluZE1hbnkoe1xuICAgICAgICAgICAgd2hlcmU6IGluQXJyYXkocHVzaFN1YnNjcmlwdGlvbnMudXNlcklkLCB1c2Vyc1RvTm90aWZ5KVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3Vicy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgICAgdXJsOiBhY3Rpb25VcmwgfHwgJy9kYXNoYm9hcmQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKHN1YnMubWFwKHN1YiA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnQ6IHN1Yi5lbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAga2V5czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcDI1NmRoOiBzdWIucDI1NmRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aDogc3ViLmF1dGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlYnB1c2guc2VuZE5vdGlmaWNhdGlvbihwdXNoQ29uZmlnLCBwYXlsb2FkKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLnN0YXR1c0NvZGUgPT09IDQxMCB8fCBlcnIuc3RhdHVzQ29kZSA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGIuZGVsZXRlKHB1c2hTdWJzY3JpcHRpb25zKS53aGVyZShlcShwdXNoU3Vic2NyaXB0aW9ucy5pZCwgc3ViLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIldlYiBQdXNoIEVycm9yOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGluc2VydCBub3RpZmljYXRpb25zOlwiLCBlcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Tm90aWZpY2F0aW9ucyh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZywgbGltaXRDb3VudCA9IDIwKSB7XG4gICAgcmV0dXJuIGF3YWl0IGRiLnNlbGVjdCgpXG4gICAgICAgIC5mcm9tKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAub3JkZXJCeShkZXNjKG5vdGlmaWNhdGlvbnMuY3JlYXRlZEF0KSlcbiAgICAgICAgLmxpbWl0KGxpbWl0Q291bnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQodGVuYW50SWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoeyB2YWx1ZTogY291bnQoKSB9KVxuICAgICAgICAuZnJvbShub3RpZmljYXRpb25zKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMudXNlcklkLCB1c2VySWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMuaXNSZWFkLCBmYWxzZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0WzBdLnZhbHVlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya05vdGlmaWNhdGlvbkFzUmVhZChpZDogc3RyaW5nKSB7XG4gICAgYXdhaXQgZGIudXBkYXRlKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC5zZXQoeyBpc1JlYWQ6IHRydWUgfSlcbiAgICAgICAgLndoZXJlKGVxKG5vdGlmaWNhdGlvbnMuaWQsIGlkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrQWxsTm90aWZpY2F0aW9uc0FzUmVhZCh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykge1xuICAgIGF3YWl0IGRiLnVwZGF0ZShub3RpZmljYXRpb25zKVxuICAgICAgICAuc2V0KHsgaXNSZWFkOiB0cnVlIH0pXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy5pc1JlYWQsIGZhbHNlKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlck5vdGlmaWNhdGlvblNldHRpbmdzKHRlbmFudElkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZGIuc2VsZWN0KClcbiAgICAgICAgLmZyb20odXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkKVxuICAgICAgICAgICAgKVxuICAgICAgICApLmxpbWl0KDEpO1xuXG4gICAgaWYgKHJlcy5sZW5ndGggPiAwKSByZXR1cm4gcmVzWzBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbm90aWZ5UGF5bWVudHM6IHRydWUsXG4gICAgICAgIG5vdGlmeUFwcGxpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5UmVmZXJlbmNlczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5U3lzdGVtOiB0cnVlXG4gICAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVVc2VyTm90aWZpY2F0aW9uU2V0dGluZ3MoXG4gICAgdGVuYW50SWQ6IHN0cmluZyxcbiAgICB1c2VySWQ6IHN0cmluZyxcbiAgICBzZXR0aW5nc0RhdGE6IHsgbm90aWZ5UGF5bWVudHM6IGJvb2xlYW4sIG5vdGlmeUFwcGxpY2F0aW9uczogYm9vbGVhbiwgbm90aWZ5UmVmZXJlbmNlczogYm9vbGVhbiwgbm90aWZ5U3lzdGVtOiBib29sZWFuIH1cbikge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGIuc2VsZWN0KCkuZnJvbSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudGVuYW50SWQsIHRlbmFudElkKSxcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudXNlcklkLCB1c2VySWQpXG4gICAgICAgICAgICApXG4gICAgICAgICkubGltaXQoMSk7XG5cbiAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBhd2FpdCBkYi51cGRhdGUodXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAgICAgLnNldCh7XG4gICAgICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhLFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVyZShlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MuaWQsIGV4aXN0aW5nWzBdLmlkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZGIuaW5zZXJ0KHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncykudmFsdWVzKHtcbiAgICAgICAgICAgIHRlbmFudElkLFxuICAgICAgICAgICAgdXNlcklkLFxuICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMFNBZ0hzQix1TUFBQSJ9
}),
"[project]/lib/actions/data:99c469 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "markNotificationAsRead",
    ()=>$$RSC_SERVER_ACTION_3
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"400f958ce06154367a0d7c633f93b5827fbd2e9f76":"markNotificationAsRead"},"lib/actions/notification.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("400f958ce06154367a0d7c633f93b5827fbd2e9f76", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "markNotificationAsRead");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vbm90aWZpY2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHNlcnZlclwiO1xuXG5pbXBvcnQgeyBkYiB9IGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgbm90aWZpY2F0aW9ucywgdXNlck5vdGlmaWNhdGlvblNldHRpbmdzIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuaW1wb3J0IHsgZXEsIGFuZCwgaW5BcnJheSwgZGVzYywgY291bnQgfSBmcm9tIFwiZHJpenpsZS1vcm1cIjtcbmltcG9ydCB3ZWJwdXNoIGZyb20gJ3dlYi1wdXNoJztcbmltcG9ydCB7IHB1c2hTdWJzY3JpcHRpb25zIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuXG53ZWJwdXNoLnNldFZhcGlkRGV0YWlscyhcbiAgICAnbWFpbHRvOmluZm9AZGVybmVrdGVidWd1bi5jb20nLFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1ZBUElEX1BVQkxJQ19LRVkgYXMgc3RyaW5nLFxuICAgIHByb2Nlc3MuZW52LlZBUElEX1BSSVZBVEVfS0VZIGFzIHN0cmluZ1xuKTtcblxuZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uVHlwZSA9ICdwYXltZW50JyB8ICdhcHBsaWNhdGlvbicgfCAncmVmZXJlbmNlJyB8ICdzeXN0ZW0nO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKFxuICAgIHRlbmFudElkOiBzdHJpbmcsXG4gICAgdXNlcklkczogc3RyaW5nW10sXG4gICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZSxcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIGJvZHk6IHN0cmluZyxcbiAgICBhY3Rpb25Vcmw/OiBzdHJpbmdcbikge1xuICAgIGlmICghdXNlcklkcyB8fCB1c2VySWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgLy8gMS4gRmV0Y2ggc2V0dGluZ3MgdG8gZmlsdGVyIG91dCB1c2VycyB3aG8gb3B0ZWQgb3V0XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBkYi5zZWxlY3QoKS5mcm9tKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncylcbiAgICAgICAgLndoZXJlKFxuICAgICAgICAgICAgYW5kKFxuICAgICAgICAgICAgICAgIGVxKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGluQXJyYXkodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkcylcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgIGNvbnN0IHNldHRpbmdNYXAgPSBuZXcgTWFwKHNldHRpbmdzLm1hcChzID0+IFtzLnVzZXJJZCwgc10pKTtcblxuICAgIC8vIEZpbHRlciBhcnJheTogVXNlciB3YW50cyBpdCBpZjogbm8gc2V0dGluZyByb3cgZm91bmQgT1Igc2V0dGluZyByb3cgZm9yIHRoaXMgdHlwZSBpcyB0cnVlLlxuICAgIGNvbnN0IHVzZXJzVG9Ob3RpZnkgPSB1c2VySWRzLmZpbHRlcih1aWQgPT4ge1xuICAgICAgICBjb25zdCBzID0gc2V0dGluZ01hcC5nZXQodWlkKTtcbiAgICAgICAgaWYgKCFzKSByZXR1cm4gdHJ1ZTsgLy8gRGVmYXVsdCBpcyB0cnVlXG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdwYXltZW50JykgcmV0dXJuIHMubm90aWZ5UGF5bWVudHM7XG4gICAgICAgIGlmICh0eXBlID09PSAnYXBwbGljYXRpb24nKSByZXR1cm4gcy5ub3RpZnlBcHBsaWNhdGlvbnM7XG4gICAgICAgIGlmICh0eXBlID09PSAncmVmZXJlbmNlJykgcmV0dXJuIHMubm90aWZ5UmVmZXJlbmNlcztcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzeXN0ZW0nKSByZXR1cm4gcy5ub3RpZnlTeXN0ZW07XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAodXNlcnNUb05vdGlmeS5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIC8vIDIuIEluc2VydCBpbnRvIG5vdGlmaWNhdGlvbnNcbiAgICBjb25zdCB2YWx1ZXMgPSB1c2Vyc1RvTm90aWZ5Lm1hcCh1aWQgPT4gKHtcbiAgICAgICAgdGVuYW50SWQsXG4gICAgICAgIHVzZXJJZDogdWlkLFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgYm9keSxcbiAgICAgICAgYWN0aW9uVXJsOiBhY3Rpb25VcmwgfHwgbnVsbCxcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkYi5pbnNlcnQobm90aWZpY2F0aW9ucykudmFsdWVzKHZhbHVlcyk7XG5cbiAgICAgICAgLy8gMy4gV2ViIFB1c2ggVHJpZ2dlciBMb2dpY1xuICAgICAgICBjb25zdCBzdWJzID0gYXdhaXQgZGIucXVlcnkucHVzaFN1YnNjcmlwdGlvbnMuZmluZE1hbnkoe1xuICAgICAgICAgICAgd2hlcmU6IGluQXJyYXkocHVzaFN1YnNjcmlwdGlvbnMudXNlcklkLCB1c2Vyc1RvTm90aWZ5KVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3Vicy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgICAgdXJsOiBhY3Rpb25VcmwgfHwgJy9kYXNoYm9hcmQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKHN1YnMubWFwKHN1YiA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnQ6IHN1Yi5lbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAga2V5czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcDI1NmRoOiBzdWIucDI1NmRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aDogc3ViLmF1dGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlYnB1c2guc2VuZE5vdGlmaWNhdGlvbihwdXNoQ29uZmlnLCBwYXlsb2FkKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLnN0YXR1c0NvZGUgPT09IDQxMCB8fCBlcnIuc3RhdHVzQ29kZSA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGIuZGVsZXRlKHB1c2hTdWJzY3JpcHRpb25zKS53aGVyZShlcShwdXNoU3Vic2NyaXB0aW9ucy5pZCwgc3ViLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIldlYiBQdXNoIEVycm9yOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGluc2VydCBub3RpZmljYXRpb25zOlwiLCBlcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Tm90aWZpY2F0aW9ucyh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZywgbGltaXRDb3VudCA9IDIwKSB7XG4gICAgcmV0dXJuIGF3YWl0IGRiLnNlbGVjdCgpXG4gICAgICAgIC5mcm9tKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAub3JkZXJCeShkZXNjKG5vdGlmaWNhdGlvbnMuY3JlYXRlZEF0KSlcbiAgICAgICAgLmxpbWl0KGxpbWl0Q291bnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQodGVuYW50SWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoeyB2YWx1ZTogY291bnQoKSB9KVxuICAgICAgICAuZnJvbShub3RpZmljYXRpb25zKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMudXNlcklkLCB1c2VySWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMuaXNSZWFkLCBmYWxzZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0WzBdLnZhbHVlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya05vdGlmaWNhdGlvbkFzUmVhZChpZDogc3RyaW5nKSB7XG4gICAgYXdhaXQgZGIudXBkYXRlKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC5zZXQoeyBpc1JlYWQ6IHRydWUgfSlcbiAgICAgICAgLndoZXJlKGVxKG5vdGlmaWNhdGlvbnMuaWQsIGlkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrQWxsTm90aWZpY2F0aW9uc0FzUmVhZCh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykge1xuICAgIGF3YWl0IGRiLnVwZGF0ZShub3RpZmljYXRpb25zKVxuICAgICAgICAuc2V0KHsgaXNSZWFkOiB0cnVlIH0pXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy5pc1JlYWQsIGZhbHNlKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlck5vdGlmaWNhdGlvblNldHRpbmdzKHRlbmFudElkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZGIuc2VsZWN0KClcbiAgICAgICAgLmZyb20odXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkKVxuICAgICAgICAgICAgKVxuICAgICAgICApLmxpbWl0KDEpO1xuXG4gICAgaWYgKHJlcy5sZW5ndGggPiAwKSByZXR1cm4gcmVzWzBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbm90aWZ5UGF5bWVudHM6IHRydWUsXG4gICAgICAgIG5vdGlmeUFwcGxpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5UmVmZXJlbmNlczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5U3lzdGVtOiB0cnVlXG4gICAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVVc2VyTm90aWZpY2F0aW9uU2V0dGluZ3MoXG4gICAgdGVuYW50SWQ6IHN0cmluZyxcbiAgICB1c2VySWQ6IHN0cmluZyxcbiAgICBzZXR0aW5nc0RhdGE6IHsgbm90aWZ5UGF5bWVudHM6IGJvb2xlYW4sIG5vdGlmeUFwcGxpY2F0aW9uczogYm9vbGVhbiwgbm90aWZ5UmVmZXJlbmNlczogYm9vbGVhbiwgbm90aWZ5U3lzdGVtOiBib29sZWFuIH1cbikge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGIuc2VsZWN0KCkuZnJvbSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudGVuYW50SWQsIHRlbmFudElkKSxcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudXNlcklkLCB1c2VySWQpXG4gICAgICAgICAgICApXG4gICAgICAgICkubGltaXQoMSk7XG5cbiAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBhd2FpdCBkYi51cGRhdGUodXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAgICAgLnNldCh7XG4gICAgICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhLFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVyZShlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MuaWQsIGV4aXN0aW5nWzBdLmlkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZGIuaW5zZXJ0KHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncykudmFsdWVzKHtcbiAgICAgICAgICAgIHRlbmFudElkLFxuICAgICAgICAgICAgdXNlcklkLFxuICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoic1NBNkhzQixtTUFBQSJ9
}),
"[project]/lib/actions/data:4c0820 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "markAllNotificationsAsRead",
    ()=>$$RSC_SERVER_ACTION_4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"608185399ed6796b6339c6e66880bd2610c1a2d2da":"markAllNotificationsAsRead"},"lib/actions/notification.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("608185399ed6796b6339c6e66880bd2610c1a2d2da", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "markAllNotificationsAsRead");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vbm90aWZpY2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHNlcnZlclwiO1xuXG5pbXBvcnQgeyBkYiB9IGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgbm90aWZpY2F0aW9ucywgdXNlck5vdGlmaWNhdGlvblNldHRpbmdzIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuaW1wb3J0IHsgZXEsIGFuZCwgaW5BcnJheSwgZGVzYywgY291bnQgfSBmcm9tIFwiZHJpenpsZS1vcm1cIjtcbmltcG9ydCB3ZWJwdXNoIGZyb20gJ3dlYi1wdXNoJztcbmltcG9ydCB7IHB1c2hTdWJzY3JpcHRpb25zIH0gZnJvbSBcIkAvbGliL2RiL3NjaGVtYVwiO1xuXG53ZWJwdXNoLnNldFZhcGlkRGV0YWlscyhcbiAgICAnbWFpbHRvOmluZm9AZGVybmVrdGVidWd1bi5jb20nLFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1ZBUElEX1BVQkxJQ19LRVkgYXMgc3RyaW5nLFxuICAgIHByb2Nlc3MuZW52LlZBUElEX1BSSVZBVEVfS0VZIGFzIHN0cmluZ1xuKTtcblxuZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uVHlwZSA9ICdwYXltZW50JyB8ICdhcHBsaWNhdGlvbicgfCAncmVmZXJlbmNlJyB8ICdzeXN0ZW0nO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKFxuICAgIHRlbmFudElkOiBzdHJpbmcsXG4gICAgdXNlcklkczogc3RyaW5nW10sXG4gICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZSxcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIGJvZHk6IHN0cmluZyxcbiAgICBhY3Rpb25Vcmw/OiBzdHJpbmdcbikge1xuICAgIGlmICghdXNlcklkcyB8fCB1c2VySWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgLy8gMS4gRmV0Y2ggc2V0dGluZ3MgdG8gZmlsdGVyIG91dCB1c2VycyB3aG8gb3B0ZWQgb3V0XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBkYi5zZWxlY3QoKS5mcm9tKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncylcbiAgICAgICAgLndoZXJlKFxuICAgICAgICAgICAgYW5kKFxuICAgICAgICAgICAgICAgIGVxKHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGluQXJyYXkodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkcylcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgIGNvbnN0IHNldHRpbmdNYXAgPSBuZXcgTWFwKHNldHRpbmdzLm1hcChzID0+IFtzLnVzZXJJZCwgc10pKTtcblxuICAgIC8vIEZpbHRlciBhcnJheTogVXNlciB3YW50cyBpdCBpZjogbm8gc2V0dGluZyByb3cgZm91bmQgT1Igc2V0dGluZyByb3cgZm9yIHRoaXMgdHlwZSBpcyB0cnVlLlxuICAgIGNvbnN0IHVzZXJzVG9Ob3RpZnkgPSB1c2VySWRzLmZpbHRlcih1aWQgPT4ge1xuICAgICAgICBjb25zdCBzID0gc2V0dGluZ01hcC5nZXQodWlkKTtcbiAgICAgICAgaWYgKCFzKSByZXR1cm4gdHJ1ZTsgLy8gRGVmYXVsdCBpcyB0cnVlXG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdwYXltZW50JykgcmV0dXJuIHMubm90aWZ5UGF5bWVudHM7XG4gICAgICAgIGlmICh0eXBlID09PSAnYXBwbGljYXRpb24nKSByZXR1cm4gcy5ub3RpZnlBcHBsaWNhdGlvbnM7XG4gICAgICAgIGlmICh0eXBlID09PSAncmVmZXJlbmNlJykgcmV0dXJuIHMubm90aWZ5UmVmZXJlbmNlcztcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzeXN0ZW0nKSByZXR1cm4gcy5ub3RpZnlTeXN0ZW07XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAodXNlcnNUb05vdGlmeS5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIC8vIDIuIEluc2VydCBpbnRvIG5vdGlmaWNhdGlvbnNcbiAgICBjb25zdCB2YWx1ZXMgPSB1c2Vyc1RvTm90aWZ5Lm1hcCh1aWQgPT4gKHtcbiAgICAgICAgdGVuYW50SWQsXG4gICAgICAgIHVzZXJJZDogdWlkLFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgYm9keSxcbiAgICAgICAgYWN0aW9uVXJsOiBhY3Rpb25VcmwgfHwgbnVsbCxcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkYi5pbnNlcnQobm90aWZpY2F0aW9ucykudmFsdWVzKHZhbHVlcyk7XG5cbiAgICAgICAgLy8gMy4gV2ViIFB1c2ggVHJpZ2dlciBMb2dpY1xuICAgICAgICBjb25zdCBzdWJzID0gYXdhaXQgZGIucXVlcnkucHVzaFN1YnNjcmlwdGlvbnMuZmluZE1hbnkoe1xuICAgICAgICAgICAgd2hlcmU6IGluQXJyYXkocHVzaFN1YnNjcmlwdGlvbnMudXNlcklkLCB1c2Vyc1RvTm90aWZ5KVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3Vicy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgICAgdXJsOiBhY3Rpb25VcmwgfHwgJy9kYXNoYm9hcmQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKHN1YnMubWFwKHN1YiA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnQ6IHN1Yi5lbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAga2V5czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcDI1NmRoOiBzdWIucDI1NmRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aDogc3ViLmF1dGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlYnB1c2guc2VuZE5vdGlmaWNhdGlvbihwdXNoQ29uZmlnLCBwYXlsb2FkKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLnN0YXR1c0NvZGUgPT09IDQxMCB8fCBlcnIuc3RhdHVzQ29kZSA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGIuZGVsZXRlKHB1c2hTdWJzY3JpcHRpb25zKS53aGVyZShlcShwdXNoU3Vic2NyaXB0aW9ucy5pZCwgc3ViLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIldlYiBQdXNoIEVycm9yOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGluc2VydCBub3RpZmljYXRpb25zOlwiLCBlcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Tm90aWZpY2F0aW9ucyh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZywgbGltaXRDb3VudCA9IDIwKSB7XG4gICAgcmV0dXJuIGF3YWl0IGRiLnNlbGVjdCgpXG4gICAgICAgIC5mcm9tKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAub3JkZXJCeShkZXNjKG5vdGlmaWNhdGlvbnMuY3JlYXRlZEF0KSlcbiAgICAgICAgLmxpbWl0KGxpbWl0Q291bnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQodGVuYW50SWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoeyB2YWx1ZTogY291bnQoKSB9KVxuICAgICAgICAuZnJvbShub3RpZmljYXRpb25zKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy50ZW5hbnRJZCwgdGVuYW50SWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMudXNlcklkLCB1c2VySWQpLFxuICAgICAgICAgICAgICAgIGVxKG5vdGlmaWNhdGlvbnMuaXNSZWFkLCBmYWxzZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0WzBdLnZhbHVlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya05vdGlmaWNhdGlvbkFzUmVhZChpZDogc3RyaW5nKSB7XG4gICAgYXdhaXQgZGIudXBkYXRlKG5vdGlmaWNhdGlvbnMpXG4gICAgICAgIC5zZXQoeyBpc1JlYWQ6IHRydWUgfSlcbiAgICAgICAgLndoZXJlKGVxKG5vdGlmaWNhdGlvbnMuaWQsIGlkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrQWxsTm90aWZpY2F0aW9uc0FzUmVhZCh0ZW5hbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykge1xuICAgIGF3YWl0IGRiLnVwZGF0ZShub3RpZmljYXRpb25zKVxuICAgICAgICAuc2V0KHsgaXNSZWFkOiB0cnVlIH0pXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcShub3RpZmljYXRpb25zLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy51c2VySWQsIHVzZXJJZCksXG4gICAgICAgICAgICAgICAgZXEobm90aWZpY2F0aW9ucy5pc1JlYWQsIGZhbHNlKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlck5vdGlmaWNhdGlvblNldHRpbmdzKHRlbmFudElkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZGIuc2VsZWN0KClcbiAgICAgICAgLmZyb20odXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAud2hlcmUoXG4gICAgICAgICAgICBhbmQoXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnRlbmFudElkLCB0ZW5hbnRJZCksXG4gICAgICAgICAgICAgICAgZXEodXNlck5vdGlmaWNhdGlvblNldHRpbmdzLnVzZXJJZCwgdXNlcklkKVxuICAgICAgICAgICAgKVxuICAgICAgICApLmxpbWl0KDEpO1xuXG4gICAgaWYgKHJlcy5sZW5ndGggPiAwKSByZXR1cm4gcmVzWzBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbm90aWZ5UGF5bWVudHM6IHRydWUsXG4gICAgICAgIG5vdGlmeUFwcGxpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5UmVmZXJlbmNlczogdHJ1ZSxcbiAgICAgICAgbm90aWZ5U3lzdGVtOiB0cnVlXG4gICAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVVc2VyTm90aWZpY2F0aW9uU2V0dGluZ3MoXG4gICAgdGVuYW50SWQ6IHN0cmluZyxcbiAgICB1c2VySWQ6IHN0cmluZyxcbiAgICBzZXR0aW5nc0RhdGE6IHsgbm90aWZ5UGF5bWVudHM6IGJvb2xlYW4sIG5vdGlmeUFwcGxpY2F0aW9uczogYm9vbGVhbiwgbm90aWZ5UmVmZXJlbmNlczogYm9vbGVhbiwgbm90aWZ5U3lzdGVtOiBib29sZWFuIH1cbikge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGIuc2VsZWN0KCkuZnJvbSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MpXG4gICAgICAgIC53aGVyZShcbiAgICAgICAgICAgIGFuZChcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudGVuYW50SWQsIHRlbmFudElkKSxcbiAgICAgICAgICAgICAgICBlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MudXNlcklkLCB1c2VySWQpXG4gICAgICAgICAgICApXG4gICAgICAgICkubGltaXQoMSk7XG5cbiAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBhd2FpdCBkYi51cGRhdGUodXNlck5vdGlmaWNhdGlvblNldHRpbmdzKVxuICAgICAgICAgICAgLnNldCh7XG4gICAgICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhLFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVyZShlcSh1c2VyTm90aWZpY2F0aW9uU2V0dGluZ3MuaWQsIGV4aXN0aW5nWzBdLmlkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZGIuaW5zZXJ0KHVzZXJOb3RpZmljYXRpb25TZXR0aW5ncykudmFsdWVzKHtcbiAgICAgICAgICAgIHRlbmFudElkLFxuICAgICAgICAgICAgdXNlcklkLFxuICAgICAgICAgICAgLi4uc2V0dGluZ3NEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMFNBbUlzQix1TUFBQSJ9
}),
"[project]/components/notification-bell.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationBell",
    ()=>NotificationBell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$598fcf__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/actions/data:598fcf [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$4f4fec__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/actions/data:4f4fec [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$99c469__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/actions/data:99c469 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$4c0820__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/actions/data:4c0820 [app-client] (ecmascript) <text/javascript>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function NotificationBell({ tenantId, userId }) {
    _s();
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [unreadCount, setUnreadCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const fetchNotifications = async ()=>{
        try {
            const [notifs, count] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$598fcf__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["getNotifications"])(tenantId, userId, 10),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$4f4fec__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["getUnreadNotificationCount"])(tenantId, userId)
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (e) {
            console.error("Failed fetching notifications", e);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationBell.useEffect": ()=>{
            fetchNotifications();
            // Poll every 60 secs only if visible and online
            const interval = setInterval({
                "NotificationBell.useEffect.interval": ()=>{
                    if (document.visibilityState === 'visible' && navigator.onLine) {
                        fetchNotifications();
                    }
                }
            }["NotificationBell.useEffect.interval"], 60000);
            return ({
                "NotificationBell.useEffect": ()=>clearInterval(interval)
            })["NotificationBell.useEffect"];
        }
    }["NotificationBell.useEffect"], [
        tenantId,
        userId
    ]);
    // Handle outside click to close dropdown
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationBell.useEffect": ()=>{
            const handleClickOutside = {
                "NotificationBell.useEffect.handleClickOutside": (event)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["NotificationBell.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "NotificationBell.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["NotificationBell.useEffect"];
        }
    }["NotificationBell.useEffect"], []);
    const handleNotificationClick = async (notif)=>{
        setIsOpen(false);
        if (!notif.isRead) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$99c469__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["markNotificationAsRead"])(notif.id);
            setUnreadCount((prev)=>Math.max(0, prev - 1));
        }
        if (notif.actionUrl) {
            router.push(notif.actionUrl);
        }
    };
    const handleMarkAllRead = async (e)=>{
        e.stopPropagation();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$data$3a$4c0820__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["markAllNotificationsAsRead"])(tenantId, userId);
        setUnreadCount(0);
        setNotifications(notifications.map((n)=>({
                ...n,
                isRead: true
            })));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 relative focus:outline-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                        className: "w-5 h-5 text-gray-600 dark:text-gray-400"
                    }, void 0, false, {
                        fileName: "[project]/components/notification-bell.tsx",
                        lineNumber: 80,
                        columnNumber: 17
                    }, this),
                    unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-zinc-900",
                        children: unreadCount > 9 ? '9+' : unreadCount
                    }, void 0, false, {
                        fileName: "[project]/components/notification-bell.tsx",
                        lineNumber: 82,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/notification-bell.tsx",
                lineNumber: 76,
                columnNumber: 13
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed sm:absolute inset-x-4 top-20 sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[80vh] flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold text-gray-900 dark:text-white",
                                children: "Bildirimler"
                            }, void 0, false, {
                                fileName: "[project]/components/notification-bell.tsx",
                                lineNumber: 91,
                                columnNumber: 25
                            }, this),
                            unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleMarkAllRead,
                                className: "text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notification-bell.tsx",
                                        lineNumber: 97,
                                        columnNumber: 33
                                    }, this),
                                    "Tümünü Okundu İşaretle"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/notification-bell.tsx",
                                lineNumber: 93,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/notification-bell.tsx",
                        lineNumber: 90,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-[60vh] overflow-y-auto",
                        children: notifications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-6 py-10 text-center flex flex-col items-center justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                        className: "w-5 h-5 text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notification-bell.tsx",
                                        lineNumber: 107,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/notification-bell.tsx",
                                    lineNumber: 106,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-gray-900 dark:text-white",
                                    children: "Bildirim Yok"
                                }, void 0, false, {
                                    fileName: "[project]/components/notification-bell.tsx",
                                    lineNumber: 109,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-500 dark:text-gray-400 mt-1",
                                    children: "Henüz yeni bir bildirim almadınız."
                                }, void 0, false, {
                                    fileName: "[project]/components/notification-bell.tsx",
                                    lineNumber: 110,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/notification-bell.tsx",
                            lineNumber: 105,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "divide-y divide-gray-100 dark:divide-zinc-800",
                            children: notifications.map((notif)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleNotificationClick(notif),
                                        className: `w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 flex-shrink-0",
                                                children: !notif.isRead ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/notification-bell.tsx",
                                                    lineNumber: 124,
                                                    columnNumber: 53
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2 h-2 rounded-full border border-gray-300 dark:border-zinc-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/notification-bell.tsx",
                                                    lineNumber: 126,
                                                    columnNumber: 53
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/notification-bell.tsx",
                                                lineNumber: 122,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-200'} truncate`,
                                                        children: notif.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/notification-bell.tsx",
                                                        lineNumber: 130,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed",
                                                        children: notif.body
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/notification-bell.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] text-gray-400 dark:text-gray-500 mt-2",
                                                        children: new Date(notif.createdAt).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/notification-bell.tsx",
                                                        lineNumber: 136,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/notification-bell.tsx",
                                                lineNumber: 129,
                                                columnNumber: 45
                                            }, this),
                                            notif.actionUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-center text-gray-400 px-1 hover:text-blue-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/notification-bell.tsx",
                                                    lineNumber: 142,
                                                    columnNumber: 53
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/notification-bell.tsx",
                                                lineNumber: 141,
                                                columnNumber: 49
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/notification-bell.tsx",
                                        lineNumber: 118,
                                        columnNumber: 41
                                    }, this)
                                }, notif.id, false, {
                                    fileName: "[project]/components/notification-bell.tsx",
                                    lineNumber: 117,
                                    columnNumber: 37
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/notification-bell.tsx",
                            lineNumber: 115,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/notification-bell.tsx",
                        lineNumber: 103,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/notification-bell.tsx",
                lineNumber: 89,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/notification-bell.tsx",
        lineNumber: 75,
        columnNumber: 9
    }, this);
}
_s(NotificationBell, "Ef+7MWFZc5NkqtgMBI11tV/hhi0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = NotificationBell;
var _c;
__turbopack_context__.k.register(_c, "NotificationBell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_26f79c74._.js.map