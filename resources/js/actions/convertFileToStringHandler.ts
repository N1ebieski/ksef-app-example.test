import { injectable } from 'inversify';
import { AbstractHandler } from './abstractHandler';

interface ConvertFileToStringAction {
    file: File;
}

@injectable()
export class ConvertFileToStringHandler extends AbstractHandler {
    public async handle(action: ConvertFileToStringAction): Promise<string> {
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(action.file);
        });
    }
}
