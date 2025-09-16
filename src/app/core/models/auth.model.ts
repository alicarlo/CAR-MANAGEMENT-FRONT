export interface RegisterUser {
  full_name: string;
  email: string;
  password: string;
  address_street_1: string;
  address_street_2: string;
  address_state: string;
  address_city: string;
  address_zip: string;
  address_country: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface UserResponse {
  access_token: string;
  full_name: string;
  refresh_token: string;
  role: Role;
  scope_list: Array<any>;
  user_id: string;
}

export interface Role {
  descriptions: string;
  id: number;
  name: string;
  status: string;
}


export interface UserSet {
  full_name: string;
  role: Role;
  scope_list: Array<any>;
  user_id: string;
}
