import {
    IExecuteFunctions,
} from 'n8n-core';

import {
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import {
    OptionsWithUri,
} from 'request';

export class Port implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Port',
        name: 'port',
        icon: 'file:port.svg',
        group: ['transform'],
        version: 1,
        description: 'Port API',
        defaults: {
            name: 'Port',
            color: '#1A82e2',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'portApi',
                required: true,
            },
        ],
        properties: [
            // Node properties which the user gets displayed and
            // can change on the node.
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Interaction',
                        value: 'interaction'
                    },
                ],
                default: 'interaction',
                required: true,
                description: 'Interaction to import'
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'interaction',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        description: 'Create an interaction'
                    },
                ],
                default: 'create',
                description: 'The operation to perform'
            },
            {
                displayName: 'Port API base',
                name: 'portApiBase',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'interaction',
                        ],
                    }
                },
                default: '',
                description: 'Port API base',
            },
            {
                displayName: 'Tenant URI',
                name: 'tenantUri',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'interaction',
                        ],
                    }
                },
                default: '',
                description: 'URI of a Port tenant',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        let authToken;
        let responseData;
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        const portApiBase = this.getNodeParameter('portApiBase', 0) as string;
        const tenantUri = this.getNodeParameter('tenantUri', 0) as string;
        //Get credentials the user provided for this node
        const credentials = this.getCredentials('portApi') as IDataObject;

        if (resource === 'interaction') {
            if (operation === 'create') {
                //Auth in Port API with given creds
                const authOptions: OptionsWithUri = {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    method: 'POST',
                    form: {
                        'client_id': credentials.user,
                        'client_secret': credentials.password,
                        'grant_type': 'client_credentials',
                    },
                    uri: `${portApiBase}/api/v2/oauth/token`,
                    json: true,
                };

                responseData = await this.helpers.request(authOptions);
                authToken = responseData.access_token

                //Create Engagement document
                const createEngagementOptions: OptionsWithUri = {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    method: 'POST',
                    body: {
                        "type": 8,
                        "uri": "discourse-engagement-forumsfastaidanielvs",
                        "data": {
                            "additional_data": {
                                "domain": "forums.fast.ai",
                                "outcome_type": 1,
                                "user_id": "forums.fast.ai-Danielvs"
                            },
                            "additionaldata": {
                                "publicationtype": 1
                            },
                            "causes": {
                                "matcher": "mvp-794/typesense/typesense-joinevent",
                                "setting_uri": "mvp-794/typesense/typesense",
                                "source": "discourse",
                                "type": "JoinEvent"
                            },
                            "display_data": {
                                "date": "2019-02-01T11:52:58.967Z",
                                "description": "Joined your discourse"
                            },
                            "scores": [
                                {
                                    "default_value": 5,
                                    "name": "relevance",
                                    "original_value": 5,
                                    "size": "S",
                                    "value": 1
                                }
                            ]
                        }
                    },
                    uri: `${portApiBase}/api/v2/documents/${tenantUri}`,
                    json: true
                }
                responseData = await this.helpers.request(createEngagementOptions);
            }
        }

        // Map data to n8n data
        return [this.helpers.returnJsonArray(responseData)];
    }
}