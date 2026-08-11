import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, retry, shareReplay } from 'rxjs';

export interface Cidade {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: number;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class CidadesService {
  private http = inject(HttpClient);
  private baseURL: string =
    'https://servicodados.ibge.gov.br/api/v1/localidades/';

  private cachedMunicipiosGeral?: Observable<Cidade[]>;
  private cachedMunicipiosPorUF = new Map<string, Observable<Cidade[]>>();

  getMunicipios(): Observable<Cidade[]> {
    if (!this.cachedMunicipiosGeral) {
      const url = `${this.baseURL}municipios`;

      this.cachedMunicipiosGeral = this.http
        .get<Cidade[]>(`${url}?orderBy=nome`)
        .pipe(
          retry(3),
          shareReplay(1), // Salva o resultado e compartilha entre todos que chamarem este método
        );
    }

    return this.cachedMunicipiosGeral;
  }

  getMunicipiosPorUF(UF: string): Observable<Cidade[]> {
    const ufNormalizada = UF?.trim().toUpperCase();

    if (!ufNormalizada || ufNormalizada.length !== 2) {
      return this.getMunicipios();
    }

    if (!this.cachedMunicipiosPorUF.has(ufNormalizada)) {
      const url = `${this.baseURL}estados/${ufNormalizada}/municipios`;

      const requisicao = this.http
        .get<Cidade[]>(`${url}?orderBy=nome`)
        .pipe(retry(3), shareReplay(1));

      this.cachedMunicipiosPorUF.set(ufNormalizada, requisicao);
    }

    return this.cachedMunicipiosPorUF.get(ufNormalizada)!;
  }

  getUFPorMunicipio(municipioId: number): Observable<string | null> {
    if (this.cachedMunicipiosGeral) {
      return this.cachedMunicipiosGeral.pipe(
        map((municipios) => {
          const cidade = municipios.find((c) => c.id === municipioId);
          return cidade ? cidade.microrregiao.mesorregiao.UF.sigla : null;
        }),
      );
    }

    const url = `${this.baseURL}municipios/${municipioId}`;
    return this.http.get<Cidade>(url).pipe(
      retry(3),
      map((cidade) => cidade?.microrregiao?.mesorregiao?.UF?.sigla ?? null),
    );
  }
}
