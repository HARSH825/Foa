import axios from 'axios';
import FormData from 'form-data'; 
import { Readable } from 'stream';

const transcribeMessage = async(userFile) => {
    try {
        if (!userFile || !userFile.buffer) {
            throw new Error("No file or buffer received");
        }
        
        const formData = new FormData();
        formData.append('model_id', 'scribe_v1');
        
        const stream = Readable.from(userFile.buffer);
        
        formData.append('file', stream, {
            filename: userFile.originalname || 'audio.wav',
            contentType: userFile.mimetype || 'audio/wav'
        });

        const response = await axios.post(
            'https://api.elevenlabs.io/v1/speech-to-text',
            formData,
            {
                headers: {
                    'xi-api-key': process.env.ELL_KEY,
                    ...formData.getHeaders()
                },
                timeout: 30000
            }
        );

        return response.data.text;
    } catch(err) {
        console.log("Transcription error:", err.response?.data || err.message);
        throw err;
    }
}
export default transcribeMessage;