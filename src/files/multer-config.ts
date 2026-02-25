import { diskStorage } from "multer";
import { extname } from "path";
import { Request } from "express";

export const multerConfig = {
  // Configura o armazenamento em disco, definindo pasta de destino e nome do arquivo
  storage: diskStorage({
    destination: './uploads',

    // Gera um nome único para o arquivo (Timestamp + Aleatório) preservando a extensão original
    filename: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),

  // Valida o tipo do arquivo antes de salvar (aceita apenas imagens jpg, jpeg, png e gif)
  fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
    callback(null, true);
  }
};