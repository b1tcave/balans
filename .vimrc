" ec command to parse Krd and Knd
" %s/,/./g | %s/^[^ ]\+ //g | %s/ /\t/g | exe ":%!datamash transpose" | %s/\t/, /g | %s/^/Krd: [/g | %s/$/],/g
"

set path+=projects
setlocal suffixesadd+=.js,.json,.jsx,.ts,.tsx
let g:prettier#autoformat = 0
autocmd BufWritePre *.js,*.jsx,*.mjs,*.ts,*.tsx,*.css,*.less,*.scss,*.json,*.graphql Prettier
let g:VimChores = extend(exists('g:VimChores') ? g:VimChores : {}, {'test': '!npm test'})

