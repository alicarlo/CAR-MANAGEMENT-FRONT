export interface Role {
  id: number,
  name: string,
  descriptions: string
  status: string,
  scope_id: Array<number>
}