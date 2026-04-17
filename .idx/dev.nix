# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11";
  # Use https://search.nixos.org/packages to find packages
  packages = [ 
    pkgs.nodejs_22  # Cambiado de 20 a 22
    pkgs.jdk17
    pkgs.android-tools
    pkgs.corepack_22 # Útil para manejar pnpm/yarn si los usas
  ];

  env = {
    # Define la ruta de Java para que Gradle la encuentre
    JAVA_HOME = "${pkgs.jdk17.home}";
  };
  # Sets environment variables in the workspace
  # env = { EXPO_USE_FAST_RESOLVER = 1; };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "msjsdiag.vscode-react-native"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install =
          "npm ci --prefer-offline --no-audit --no-progress --timing && npm i @expo/ngrok@^4.1.0";
      };
      # Runs when a workspace restarted
      onStart = {
        connect-device = ''
          adb -s localhost:5554 wait-for-device 
        '';
        android = ''
          npx expo start --android --tunnel
        '';
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        android = {
          manager = "android";
        };
      };
    };
  };
}
