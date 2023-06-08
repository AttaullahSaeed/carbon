import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import { Tokens } from './models/models.js';


export const postRequest = async (config) => {
    return axios.post(config.url, config.data, {
        headers: config.headers
    })
    .then((response) => {
        console.log('got success!');
        return response.data[0];
    })
    .catch((error) => {
        console.log(`error in POST to ${config.url}`);
        //console.log(error.response);
        return error;
    })
}

export const setEnvValue = (key, value) => {

    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}


export const saveTokenToDB = async tokenSet => {
    try {
        const token = await Tokens.upsert({
            id: 1,
            tokenSet
        });
        return token;
    } catch (error) {
        console.log(error);
    }
    
}

export const getTokenFromDB = async () => {
    
    const tokenSet = await Tokens.findOne({
        id:1
    });

    if (tokenSet === null) {
        return null;
      } else {
        return tokenSet;
      }
}
