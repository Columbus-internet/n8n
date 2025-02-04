import {
    ICredentialType,
    NodePropertyTypes,
} from 'n8n-workflow';

export class PortApi implements ICredentialType {
    name = 'portApi';
    displayName = 'Port API';
    documentationUrl = 'port';
    properties = [
        {
			displayName: 'User',
			name: 'user',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
		},
    ];
}