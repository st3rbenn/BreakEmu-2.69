interface IWorldServerData {
  id: number,
  address: string,
  port: number,
  name: string,
  capacity: number,
  requiredRole: number,
  isMonoAccount: boolean,
  isSelectable: boolean,
  requireSubscription: boolean
}

export default IWorldServerData