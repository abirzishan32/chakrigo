// Simple tldraw sync server setup
// This is a basic implementation for local development
// For production, you'd want to set up a proper sync server

export const createSyncStore = () => {
  // Mock sync store for local development
  return {
    connect: () => {},
    disconnect: () => {},
    assets: {
      upload: async (asset: any, file: File) => {
        // Simple file upload simulation
        const url = URL.createObjectURL(file);
        return { src: url };
      },
      resolve: (asset: any) => asset.props.src,
    },
  };
};
