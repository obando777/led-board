// Fix expo autolinking in pnpm monorepo.
// The default resolution generates 'expo.core.ExpoModulesPackage' (from the namespace)
// but the actual class is at 'expo.modules.ExpoModulesPackage'.
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: {
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
          packageInstance: 'new ExpoModulesPackage()',
        },
      },
    },
  },
};
