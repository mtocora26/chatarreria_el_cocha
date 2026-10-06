import { describe, expect, it } from "vitest";
import { generarCsv } from "./csv";

const sinBom = (csv: string) => csv.replace("﻿", "");

describe("generarCsv", () => {
  it("empieza con BOM y separa con punto y coma", () => {
    const csv = generarCsv(["A", "B"], [["x", 1]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(sinBom(csv)).toBe("A;B\r\nx;1\r\n");
  });

  it("escribe los números con coma decimal sin comillas", () => {
    expect(sinBom(generarCsv(["Kg"], [[12.5], [3500]]))).toBe("Kg\r\n12,5\r\n3500\r\n");
  });

  it("deja vacío lo nulo", () => {
    expect(sinBom(generarCsv(["A", "B"], [[null, "x"]]))).toBe("A;B\r\n;x\r\n");
  });

  it("entrecomilla textos con separador, comillas o saltos de línea", () => {
    const csv = sinBom(generarCsv(["T"], [["a;b"], ['di "hola"'], ["x\ny"]]));
    expect(csv).toBe('T\r\n"a;b"\r\n"di ""hola"""\r\n"x\ny"\r\n');
  });

  it("neutraliza textos que Excel ejecutaría como fórmula", () => {
    const csv = sinBom(generarCsv(["T"], [["=1+1"], ["@SUMA(A1)"], ["-5 kg"], ["+57"]]));
    expect(csv).toBe("T\r\n'=1+1\r\n'@SUMA(A1)\r\n'-5 kg\r\n'+57\r\n");
  });
});
