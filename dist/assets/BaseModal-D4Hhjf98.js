import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{bt as t}from"./vendor-DUQ2mICt.js";import{G as n,t as r}from"./vendor-react-UbTc4uYh.js";var i=e(t(),1),a=n(),o=({isOpen:e,onClose:t,title:n,icon:o,iconColor:s=`text-accent-blue`,children:c})=>((0,i.useEffect)(()=>(e?document.body.style.overflow=`hidden`:document.body.style.overflow=``,()=>{document.body.style.overflow=``}),[e]),e?(0,a.jsx)(`div`,{className:`fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4`,onClick:e=>{e.target===e.currentTarget&&t()},children:(0,a.jsxs)(`div`,{className:`
          w-full sm:max-w-md
          bg-[#121418] border border-white/10
          rounded-t-3xl sm:rounded-2xl
          shadow-2xl
          transform transition-all
          animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95
          duration-200
          flex flex-col
        `,style:{maxHeight:`92dvh`},children:[(0,a.jsx)(`div`,{className:`flex justify-center pt-3 pb-1 sm:hidden`,children:(0,a.jsx)(`div`,{className:`w-10 h-1 rounded-full bg-white/20`})}),(0,a.jsxs)(`div`,{className:`flex justify-between items-center px-6 py-4 border-b border-white/5 shrink-0`,children:[(0,a.jsxs)(`h2`,{className:`flex items-center gap-2 text-lg font-semibold text-white`,children:[o&&(0,a.jsx)(o,{size:22,className:s}),n]}),(0,a.jsx)(`button`,{onClick:t,className:`p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors`,children:(0,a.jsx)(r,{size:20})})]}),(0,a.jsx)(`div`,{className:`px-6 py-5 overflow-y-auto flex-1 pb-safe`,children:c})]})}):null);export{o as t};