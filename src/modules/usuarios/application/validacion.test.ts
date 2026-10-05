import { describe, expect, it } from "vitest";
import { correoDeCuenta, esquemaNuevoTrabajador } from "./validacion";

const valido = {
  nombre: "Ana Pérez",
  usuario: " Ana.Perez ",
  correo: "",
  password: "clave-segura",
};

describe("esquemaNuevoTrabajador", () => {
  it("normaliza el usuario a minúsculas sin espacios", () => {
    const resultado = esquemaNuevoTrabajador.parse(valido);
    expect(resultado.usuario).toBe("ana.perez");
  });

  it("rechaza usuarios con caracteres no permitidos o muy cortos", () => {
    expect(esquemaNuevoTrabajador.safeParse({ ...valido, usuario: "ab" }).success).toBe(false);
    expect(esquemaNuevoTrabajador.safeParse({ ...valido, usuario: "ana perez" }).success).toBe(
      false,
    );
  });

  it("exige contraseña de al menos 8 caracteres", () => {
    expect(esquemaNuevoTrabajador.safeParse({ ...valido, password: "corta" }).success).toBe(false);
  });

  it("acepta correo vacío y rechaza uno mal escrito", () => {
    expect(esquemaNuevoTrabajador.safeParse(valido).success).toBe(true);
    expect(esquemaNuevoTrabajador.safeParse({ ...valido, correo: "no-es-correo" }).success).toBe(
      false,
    );
  });
});

describe("correoDeCuenta", () => {
  it("usa el correo escrito o genera uno interno", () => {
    expect(correoDeCuenta("ana", "ana@correo.com")).toBe("ana@correo.com");
    expect(correoDeCuenta("ana", "")).toBe("ana@trabajadores.elcocha.local");
  });
});
