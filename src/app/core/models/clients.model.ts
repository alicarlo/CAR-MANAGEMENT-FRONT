export interface Clients {
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
