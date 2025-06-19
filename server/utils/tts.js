import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import dotenv from 'dotenv';
dotenv.config();

export default async function tts(llmResponse) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY2 });
    console.log("converting to speech");
  const config = {
    temperature: 1,
    responseModalities: ['audio'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Sadachbia' },
      },
    },
  };

  const model = 'gemini-2.5-flash-preview-tts';
  const contents = [{
    role: 'user',
    parts: [{ text: llmResponse }],
  }];

  let audioBuffers = [];
  let mimeType = 'audio/webm'; 
  const response = await ai.models.generateContentStream({ model, config, contents });

  for await (const chunk of response) {
    const inlineData = chunk?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData) {
      mimeType = inlineData.mimeType || mimeType;
      const buffer = Buffer.from(inlineData.data, 'base64');
      audioBuffers.push(buffer);
    } else if (chunk.text) {
      console.log('[TTS-TextChunk]:', chunk.text);
    }
  }

  let completeBuffer = Buffer.concat(audioBuffers);

  if (!mimeType.includes('wav')) {
    const options = parseMimeType(mimeType);
    const wavHeader = createWavHeader(completeBuffer.length, options);
    completeBuffer = Buffer.concat([wavHeader, completeBuffer]);
    mimeType = 'audio/wav'; // final mime type
  }

  const base64Audio = completeBuffer.toString('base64');

  return {
    base64Audio,
    mimeType,
  };
}
//wav conversion

function parseMimeType(mimeType) {
  // example: audio/L16;rate=24000
  const [type, ...params] = mimeType.split(';').map((s) => s.trim());
  const [, format] = type.split('/');

  const options = {
    numChannels: 1,
    sampleRate: 24000, 
    bitsPerSample: 16, 
  };

  for (const param of params) {
    const [key, value] = param.split('=');
    if (key === 'rate') options.sampleRate = parseInt(value, 10);
  }

  return options;
}

function createWavHeader(dataLength, { numChannels, sampleRate, bitsPerSample }) {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}
