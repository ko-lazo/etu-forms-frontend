import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['app/api/schema.d.ts']
  },
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'vue/multi-word-component-names': 'off',
      'eqeqeq': ['error', 'always']
    }
  }
)
