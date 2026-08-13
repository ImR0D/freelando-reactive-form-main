import { Component, effect, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CadastroService } from '../../shared/services/cadastro-service';
import { Router } from '@angular/router';
import { Estado, EstadosService } from '../../shared/services/estados-service';
import { Cidade, CidadesService } from '../../shared/services/cidades-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmailValidatorService } from '../../shared/services/email-validator.service';
import { FormConfig } from '../../shared/models/form-config.interface';
import { DynamicFormService } from '../../shared/services/dynamic-form.service';
import { getDadosPessoaisConfig } from '../../config/dados-pessoais-form.config';
import {
  FormFieldBase,
  FormFieldType,
} from '../../shared/models/form-field-base.interface';

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
export class DadosPessoaisFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private estadosService = inject(EstadosService);
  private cidadesService = inject(CidadesService);
  private cadastroService = inject(CadastroService);

  private dynamicFormService = inject(DynamicFormService);

  formConfig!: FormConfig;

  estados: Estado[] = [];
  cidades: Cidade[] = [];

  private formOptions: AbstractControlOptions = {
    validators: equalPasswordsValidator,
  };

  public dadosPessoaisForm!: FormGroup;
  private estadoSelecionado!: Signal<any>;
  private cidadeSelecionada!: Signal<any>;

  private atualizarCampoEstado(UF: string): void {
    this.dadosPessoaisForm.get('estado')?.patchValue(UF, { emitEvent: false });
  }

  constructor(private emailService: EmailValidatorService) {
    this.dynamicFormService.registerFormConfig('dadosPessoaisForm', () =>
      getDadosPessoaisConfig(this.emailService),
    );

    this.formConfig =
      this.dynamicFormService.getFormConfig('dadosPessoaisForm');

    this.dadosPessoaisForm = this.dynamicFormService.createFormGroup(
      this.formConfig,
      this.formOptions,
    );

    this.cidadeSelecionada = toSignal(
      this.dadosPessoaisForm.get('estado')!.valueChanges,
      {
        initialValue: '',
      },
    );

    this.estadoSelecionado = toSignal(
      this.dadosPessoaisForm.get('estado')!.valueChanges,
      {
        initialValue: '',
      },
    );

    effect(() => {
      try {
        let UF = this.estadoSelecionado() ?? null;
        this.loadMunicipios(UF);
      } catch {}
    });

    effect(() => {
      try {
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
      } catch {}
    });
  }

  ngOnInit(): void {
    this.loadEstados();
    this.loadMunicipios();
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

  isFieldType(field: FormFieldBase, type: FormFieldType): boolean {
    return field.type === type;
  }
  hasField(name: string): boolean {
    return this.formConfig.fields.some(
      (field) => field.formControlName === name,
    );
  }
  getFieldByName(name: string): FormFieldBase {
    return (
      this.formConfig.fields.find((field) => field.formControlName === name) ||
      ({} as FormFieldBase)
    );
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
