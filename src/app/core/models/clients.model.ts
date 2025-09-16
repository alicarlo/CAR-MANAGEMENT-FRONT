/*export interface Clients {
  id: string;               
  nombreCompleto: string;   
  direccion?: string;        
  telefono: string;         
  celular?: string;         
  telefonoTrabajo?: string;  
  fechaNacimiento?: Date;    
  estado: string;            
  ciudad: string;           
  correo?: string;          
  sexo: "Masculino" | "Femenino";
  rfc?: string;            
  estatus: string; 
}
  */

export interface Clients {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  phone_mobile: string;
  phone_work: string;
  address_street_1: string;
  address_street_2: string;
  address_state: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  birthday: string | Date;
  gender: string;
  rfc: string;
  created_at: string;
  updated_at: string;
  status: string;
}
