import { Validators } from '@angular/forms';
import { FormConfig } from '../shared/models/form-config.interface';
import { cpfValidator } from '../shared/validators/cpf.validator';
import { emailExistenteValidator } from '../shared/validators/emailExistente.validator';

export function getDadosPessoaisConfig(emailService: any): FormConfig {
  return {
    title: 'CRIE SEU CADASTRO',
    description: 'CRIE SEU PERFIL GRATUITAMENTE PARA TRABALHAR COMO FREELANCE',
    fields: [
      {
        label: 'Nome completo',
        formControlName: 'nomeCompleto',
        type: 'text',
        required: true,
        errorMessages: {
          required: 'Nome completo: campo obrigatório',
        },
        validators: [Validators.required],
        size: 'full',
      },
      {
        label: 'CPF',
        formControlName: 'cpf',
        type: 'text',
        required: true,
        errorMessages: {
          maxlength:
            'CPF deve possuir até 14 caracteres (considerando números e separadores)',
          required: 'CPF: campo obrigatório',
          cpfValidator: 'CPF inválido',
        },
        validators: [
          Validators.maxLength(14),
          Validators.required,
          cpfValidator,
        ],
        size: 'full',
      },
      {
        label: 'Estado',
        formControlName: 'estado',
        type: 'select',
        required: true,
        placeholder: 'Selecione',
        errorMessages: {
          required: 'Estado: campo obrigatório',
        },
        validators: [Validators.required],
        size: 'half',
      },
      {
        label: 'Cidade',
        formControlName: 'cidade',
        type: 'select',
        required: true,
        errorMessages: {
          required: 'Cidade: campo obrigatório',
        },
        validators: [Validators.required],
        size: 'half',
      },
      {
        label: 'E-mail',
        formControlName: 'email',
        type: 'email',
        required: true,
        errorMessages: {
          required: 'E-mail: campo obrigatório',
          email: 'E-mail inválido',
          emailExistente: 'E-mail já cadastrado',
        },
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailExistenteValidator(emailService)],
        size: 'full',
      },
      {
        label: 'Senha',
        formControlName: 'senha',
        type: 'password',
        required: true,
        errorMessages: {
          required: 'Senha: campo obrigatório',
          minlength: 'A senha deve possuir pelo menos 6 caracteres',
        },
        validators: [Validators.required, Validators.minLength(6)],
        size: 'half',
      },
      {
        label: 'Confirmar senha',
        formControlName: 'confirmarSenha',
        type: 'password',
        required: true,
        errorMessages: {
          required: 'Confirmação de senha: campo obrigatório',
          passwordFieldsMissmatch: 'As senhas informadas não correspondem',
        },
        validators: [Validators.required],
        size: 'half',
      },
    ],
  };
}
