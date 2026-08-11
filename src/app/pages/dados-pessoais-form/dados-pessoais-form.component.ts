import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CadastroService } from '../../shared/services/cadastro-service';
import { Router } from '@angular/router';
import { Estado, EstadosService } from '../../shared/services/estados-service';
import { Cidade, CidadesService } from '../../shared/services/cidades-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { cpfValidator } from '../../shared/validators/cpf.validator';

export const equalPasswordsValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const senha = control.get('senha');
  const confirmaSenha = control.get('confirmarSenha');

  const hasPasswords = senha && confirmaSenha;
  const isPasswordMatches = senha?.value === confirmaSenha?.value;
  const hasPasswordsEnoughLength =
    String(senha?.value).length >= 6 &&
    String(confirmaSenha?.value).length >= 6;

  if (!hasPasswordsEnoughLength) {
    return { passwordFieldsLength: true };
  }

  return hasPasswords && isPasswordMatches
    ? null
    : { passwordFieldsMissmatch: true };
};

@Component({
  selector: 'app-dados-pessoais-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './dados-pessoais-form.component.html',
  styleUrls: ['./dados-pessoais-form.component.scss'],
})
export class DadosPessoaisFormComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private estadosService = inject(EstadosService);
  private cidadesService = inject(CidadesService);
  private cadastroService = inject(CadastroService);

  estados: Estado[] = [];
  cidades: Cidade[] = [];

  private formOptions: AbstractControlOptions = {
    validators: equalPasswordsValidator,
  };

  public dadosPessoaisForm: FormGroup = this.formBuilder.group(
    {
      nomeCompleto: ['', Validators.required],
      cpf: ['', [Validators.maxLength(14), Validators.required, cpfValidator]],
      estado: ['', Validators.required],
      cidade: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required],
    },
    this.formOptions,
  );

  private estadoSelecionado = toSignal(
    this.dadosPessoaisForm.get('estado')!.valueChanges,
    {
      initialValue: '',
    },
  );

  private cidadeSelecionada = toSignal(
    this.dadosPessoaisForm.get('cidade')!.valueChanges,
    {
      initialValue: '',
    },
  );

  private atualizarCampoEstado(UF: string): void {
    this.dadosPessoaisForm.get('estado')?.patchValue(UF, { emitEvent: false });
  }

  constructor() {
    this.loadEstados();
    this.loadMunicipios();

    effect(() => {
      let UF = this.estadoSelecionado() ?? null;
      this.loadMunicipios(UF);
    });

    effect(() => {
      const nomeCidade = this.cidadeSelecionada();
      const selecteddUF = this.estadoSelecionado();

      if (nomeCidade && !selecteddUF) {
        const cidadeObj = this.cidades.find((c) => c.nome === nomeCidade);

        if (cidadeObj) {
          const ufEncontrada = cidadeObj.microrregiao?.mesorregiao?.UF?.sigla;

          if (ufEncontrada) {
            this.atualizarCampoEstado(ufEncontrada);
          } else {
            this.cidadesService.getUFPorMunicipio(cidadeObj.id).subscribe({
              next: (uf) => {
                if (uf) {
                  this.atualizarCampoEstado(uf);
                }
              },
            });
          }
        }
      }
    });
  }

  onAnterior(): void {
    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/area-atuacao']);
  }

  onProximo(): void {
    if (!this.dadosPessoaisForm.valid) {
      this.dadosPessoaisForm.markAllAsTouched();
      return;
    }

    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/perfil']);
  }

  loadEstados() {
    this.estadosService.getEstados().subscribe({
      next: (estados: Estado[]) => {
        this.estados = [...estados];
      },
      error: (error: any) => console.error('ERROR: ', error),
    });
  }

  loadMunicipios(UF?: string | null): void {
    const sendRequestAs = UF
      ? this.cidadesService.getMunicipiosPorUF(UF)
      : this.cidadesService.getMunicipios();

    sendRequestAs.subscribe({
      next: (municipios) => {
        this.cidades = municipios;
      },
      error: (err) => {
        console.error('Erro ao carregar cidades: ', err);
      },
    });
  }

  private salvarDadosAtuais() {
    const formValue = this.dadosPessoaisForm.value;

    this.cadastroService.updateCadastroData({
      nomeCompleto: formValue.nomeCompleto,
      estado: formValue.estado,
      cidade: formValue.cidade,
      email: formValue.email,
      senha: formValue.senha,
    });
  }
}
