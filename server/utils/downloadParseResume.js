import axios from 'axios';
import pdfParse from 'pdf-parse';

const downloadParseResume = async (resumeURL) => {
//    console.log("Downloading and parsing resume from URL:", resumeURL);
    try {
        const response = await axios.get(resumeURL, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        const buffer = Buffer.from(response.data);
        const parsedData = (await pdfParse(buffer)).text;
        
        // console.log("Resume parsed:", parsedData);
        return parsedData;
    } catch (error) {
        console.error("Error downloading or parsing resume:", error);
        throw new Error('Failed to download or parse resume');
    }
};

export default downloadParseResume;