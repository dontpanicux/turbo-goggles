import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const bindingFile = join(__dirname, '..', 'node_modules', 'rolldown', 'dist', 'shared', 'binding-BbrDfv1x.mjs')

if (!existsSync(bindingFile)) {
  console.log('[patch-rolldown] Binding file not found, skipping patch')
  process.exit(0)
}

let content = readFileSync(bindingFile, 'utf-8')

const target = 'if (!nativeBinding && globalThis.process?.versions?.["webcontainer"]) try {\n\t\tnativeBinding = require_webcontainer_fallback();\n\t} catch (err) {'
const replacement = 'if (!nativeBinding && globalThis.process?.versions?.["webcontainer"]) try {\n\t\tnativeBinding = require_webcontainer_fallback();\n\t\t__napiLoadedBindingTarget = "wasm32-wasi";\n\t} catch (err) {'

if (content.includes('__napiLoadedBindingTarget = "wasm32-wasi";\n\t} catch (err) {\n\t\tloadErrors.push(err);\n\t}\n\tif (!nativeBinding) {')) {
  console.log('[patch-rolldown] Already patched, skipping')
  process.exit(0)
}

if (!content.includes(target)) {
  console.log('[patch-rolldown] Target pattern not found, skipping')
  process.exit(0)
}

content = content.replace(target, replacement)
writeFileSync(bindingFile, content)
console.log('[patch-rolldown] Patched binding-BbrDfv1x.mjs: set __napiLoadedBindingTarget to "wasm32-wasi" after WebContainer fallback')
