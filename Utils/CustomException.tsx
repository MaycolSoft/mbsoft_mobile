interface CustomExceptionData {
  code: string;
  message: string;
  data?: object;
}


class CustomException extends Error {
  code?:string;
  data?:object;

  constructor(message: string |  CustomExceptionData) {

    if (typeof message === 'string') {
      super(message);
    }else{
      super(message.message);
      this.name = 'CustomException';
      this.message = message.message
      this.data = message.data
      this.code = message.code
    }
  }
}


export default CustomException
