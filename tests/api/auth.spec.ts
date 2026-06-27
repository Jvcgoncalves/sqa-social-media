import { expect, test } from "@playwright/test";
import { AuthApi } from "../support/AuthApi";
import { TestData } from "../support/TestData";

test.describe("API de autenticacao", () => {
  test("POST /auth/signup cria usuário com dados válidos", async ({ request }) => {
    const user = TestData.user();
    const response = await AuthApi.signup(request, user);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: user.email,
      })
    );
  });

  test("POST /auth/signup rejeita e-mail inválido", async ({ request }) => {
    const response = await AuthApi.signup(request, TestData.invalidEmailUser());

    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body).toEqual({
      message: "E-mail inválido",
      status: 422,
    });
  });

  test("POST /auth/signup rejeita e-mail duplicado", async ({ request }) => {
    const user = TestData.user();
    const firstResponse = await AuthApi.signup(request, user);
    const secondResponse = await AuthApi.signup(request, user);

    expect(firstResponse.status()).toBe(200);
    expect(secondResponse.status()).toBe(409);

    const body = await secondResponse.json();
    expect(body).toEqual({
      message: "E-mail já está em uso",
      status: 409,
    });
  });

  test("POST /auth/signin autentica usuário existente", async ({ request }) => {
    const user = TestData.user();
    const signupResponse = await AuthApi.signup(request, user);

    expect(signupResponse.status()).toBe(200);

    const response = await AuthApi.signin(request, user);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: user.email,
      })
    );
  });
});
