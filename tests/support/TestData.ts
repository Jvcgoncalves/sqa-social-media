export class TestData {
  static validPassword = "Senha@123";

  static user() {
    return {
      email: `atividade5.${Date.now()}.${Math.random().toString(36).slice(2)}@teste.com`,
      password: TestData.validPassword,
    };
  }

  static invalidEmailUser() {
    return {
      email: "email-invalido",
      password: TestData.validPassword,
    };
  }
}
