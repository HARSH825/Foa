import axios from 'axios';
import pdfParse from 'pdf-parse';

const parseJD = async (jdData, isUrl = false) => {
    try {
        if (isUrl) {
            const response = await axios.get(jdData, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const buffer = Buffer.from(response.data);
            const parsedData = (await pdfParse(buffer)).text;
            
            return parsedData;
        } else {
            return jdData;
        }
    } catch (error) {
        console.error("Error parsing JD:", error);
        throw new Error('Failed to parse Job Description');
    }
};

export default parseJD;