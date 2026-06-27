package com.demoapp.demo.controller;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.demoapp.demo.model.User;
import com.demoapp.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerActivity4Test {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @BeforeEach
  void setUp() {
    userRepository.deleteAll();
  }

  @Test
  void signupWithValidEmailAndStrongPasswordCreatesUser() throws Exception {
    mockMvc.perform(post("/auth/signup")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "email": "student@example.com",
              "password": "Strong1!"
            }
            """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email", is("student@example.com")));
  }

  @Test
  void signinWithWrongPasswordReturnsUnauthorized() throws Exception {
    User user = new User();
    user.setEmail("student@example.com");
    user.setPassword("Strong1!");
    userRepository.save(user);

    mockMvc.perform(post("/auth/signin")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "email": "student@example.com",
              "password": "Wrong12!"
            }
            """))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void signupWithInvalidEmailReturnsValidationError() throws Exception {
    mockMvc.perform(post("/auth/signup")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "email": "student@",
              "password": "Strong1!"
            }
            """))
        .andExpect(status().isUnprocessableEntity());
  }
}
