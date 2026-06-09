import type { FlatConfigComposer } from "../node_modules/.pnpm/eslint-flat-config-utils@2.1.4/node_modules/eslint-flat-config-utils/dist/index.mjs"
import { defineFlatConfigs } from "../node_modules/.pnpm/@nuxt+eslint-config@1.0.1_@typescript-eslint+utils@8.59.1_eslint@9.39.4_jiti@2.6.1__typ_8e04f058a31b1095d84d90e7c1e3d7a6/node_modules/@nuxt/eslint-config/dist/flat.mjs"
import type { NuxtESLintConfigOptionsResolved } from "../node_modules/.pnpm/@nuxt+eslint-config@1.0.1_@typescript-eslint+utils@8.59.1_eslint@9.39.4_jiti@2.6.1__typ_8e04f058a31b1095d84d90e7c1e3d7a6/node_modules/@nuxt/eslint-config/dist/flat.mjs"

declare const configs: FlatConfigComposer
declare const options: NuxtESLintConfigOptionsResolved
declare const withNuxt: typeof defineFlatConfigs
export default withNuxt
export { withNuxt, defineFlatConfigs, configs, options }