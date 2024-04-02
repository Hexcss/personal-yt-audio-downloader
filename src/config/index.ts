import "dotenv/config";

const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
  };
  
  export const environment = {
    nodeEnv: getEnvVariable('NODE_ENV'),
    storageBucket: getEnvVariable('STORAGE_BUCKET'),
    projectId: getEnvVariable('PROJECT_ID'),
  };
