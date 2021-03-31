
const ExceptionMapping = {
    "20410100": 'error.class_end',
    "20403001": 'error.room_is_full',
}

export class BusinessExceptions {
    static getReadableText(errCode?: string):string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        return 'error.unknown'
    }
}