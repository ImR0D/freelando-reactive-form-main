import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EstadosService {
  private http = inject(HttpClient);
  private URL: string =
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

  getEstados(): Observable<Estado[]> {
    return from(
      this.http
        .get<Estado[]>(this.URL)
        .pipe(
          map((estados: Estado[]) =>
            [...estados].sort((a, b) => a.nome.localeCompare(b.nome)),
          ),
        ),
    );
  }
}
