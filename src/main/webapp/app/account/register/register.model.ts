export class Registration {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public langKey: string,
    public firstName: string,
    public secondName: string,
    public firstLastName: string,
    public secondLastName: string,
    public phoneNumber: number,
    public photo: string,
    public identityNumber: string,
    public address: string,
    public province: string,
    public canton: string,
    public district: string
  ) {}
}
