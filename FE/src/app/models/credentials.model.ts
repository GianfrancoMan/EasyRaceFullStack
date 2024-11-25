export interface UserLogin {
  email:string;
  password:string;
}

export interface LoginResponse {
  token:string;
  expiresIn:number;
}

