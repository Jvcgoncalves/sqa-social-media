const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";

export class AuthApi {
  static signup(request, user) {
    return request.post(`${apiBaseUrl}/auth/signup`, {
      data: user,
    });
  }

  static signin(request, user) {
    return request.post(`${apiBaseUrl}/auth/signin`, {
      data: user,
    });
  }

  static async createUser(request) {
    const { TestData } = await import("./TestData");
    const user = TestData.user();
    const response = await AuthApi.signup(request, user);

    if (!response.ok()) {
      throw new Error(`Não foi possível criar o usuário para o teste. Status: ${response.status()}`);
    }

    return user;
  }
}
