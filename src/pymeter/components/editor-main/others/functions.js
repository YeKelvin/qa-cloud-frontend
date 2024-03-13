const getFunctions = () => [
  {
    name: '随机数',
    code: 'RANDOM',
    func: [
      {
        name: 'ulid',
        desc: '生成统一唯一标识符',
        code: '__ulid',
        args: []
      },
      {
        name: 'uuid',
        desc: '生成通用唯一识别码',
        code: '__uuid',
        args: []
      },
      {
        name: 'phone',
        desc: '随机生成大陆手机号',
        code: '__phone',
        args: [
          {
            name: 'operator',
            desc: '通讯运营商',
            value: '',
            default: 'ALL',
            required: false,
            options: ['CMCC', 'CUCC', 'TELECOM']
          }
        ]
      },
      {
        name: 'random',
        desc: '随机生成指定长度的整数',
        code: '__random',
        args: [{ name: 'length', desc: '随机数长度', value: '', default: '16', required: false }]
      },
      {
        name: 'random_int',
        desc: '随机生成指定区间内的整数',
        code: '__random_int',
        args: [
          { name: 'minimum', desc: '区间最小值', value: '', default: '', required: true },
          { name: 'maximum', desc: '区间最大值', value: '', default: '', required: true }
        ]
      },
      {
        name: 'random_choice',
        desc: '随机生成指定字符串中的字符',
        code: '__random_choice',
        args: [{ name: 'sequence', desc: '字符串', value: '', default: '', required: true }]
      }
    ]
  },
  {
    name: '伪造类',
    code: 'FAKER',
    func: [
      {
        name: 'fake',
        desc: '伪造测试数据',
        code: '__fake',
        args: [
          {
            name: 'provider',
            desc: '伪造函数',
            value: '',
            default: '',
            required: true,
            options: [
              'aba',
              'address',
              'administrative_unit',
              'am_pm',
              'ascii_company_email',
              'ascii_email',
              'ascii_free_email',
              'ascii_safe_email',
              'automotive',
              'bank',
              'bank_country',
              'barcode',
              'bban',
              'bs',
              'building_number',
              'catch_phrase',
              'century',
              'city',
              'city_name',
              'city_suffix',
              'color',
              'company',
              'company_email',
              'company_prefix',
              'company_suffix',
              'country',
              'country_calling_code',
              'country_code',
              'credit_card',
              'currency',
              'current_country',
              'current_country_code',
              'date',
              'date_between',
              'date_between_dates',
              'date_object',
              'date_of_birth',
              'date_this_century',
              'date_this_decade',
              'date_this_month',
              'date_this_year',
              'date_time',
              'date_time_ad',
              'date_time_between',
              'date_time_between_dates',
              'date_time_this_century',
              'date_time_this_decade',
              'date_time_this_month',
              'date_time_this_year',
              'day_of_month',
              'day_of_week',
              'dga',
              'district',
              'domain_name',
              'domain_word',
              'email',
              'emoji',
              'file',
              'first_name',
              'first_name_female',
              'first_name_male',
              'first_name_nonbinary',
              'first_romanized_name',
              'free_email',
              'free_email_domain',
              'future_date',
              'future_datetime',
              'geo',
              'hostname',
              'http_method',
              'http_status_code',
              'iana_id',
              'iban',
              'image_url',
              'internet',
              'ipv4',
              'ipv4_network_class',
              'ipv4_private',
              'ipv4_public',
              'ipv6',
              'isbn',
              'iso8601',
              'job',
              'language_name',
              'last_name',
              'last_name_female',
              'last_name_male',
              'last_name_nonbinary',
              'last_romanized_name',
              'license_plate',
              'lorem',
              'mac_address',
              'misc',
              'month',
              'month_name',
              'msisdn',
              'name',
              'name_female',
              'name_male',
              'name_nonbinary',
              'nic_handle',
              'nic_handles',
              'paragraph',
              'paragraphs',
              'passport',
              'past_date',
              'past_datetime',
              'person',
              'phone_number',
              'phonenumber_prefix',
              'port_number',
              'postcode',
              'prefix',
              'prefix_female',
              'prefix_male',
              'prefix_nonbinary',
              'profile',
              'province',
              'python',
              'pytimezone',
              'ripe_id',
              'romanized_name',
              'safe_domain_name',
              'safe_email',
              'sbn',
              'sentence',
              'sentences',
              'slug',
              'ssn',
              'street_address',
              'street_name',
              'street_suffix',
              'suffix',
              'suffix_female',
              'suffix_male',
              'suffix_nonbinary',
              'swift',
              'swift11',
              'swift8',
              'text',
              'texts',
              'time',
              'time_delta',
              'time_object',
              'time_series',
              'timezone',
              'tld',
              'unix_time',
              'uri',
              'uri_extension',
              'uri_page',
              'uri_path',
              'url',
              'user_agent',
              'user_name',
              'vin',
              'word',
              'words',
              'year'
            ]
          },
          { name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }
        ]
      },
      {
        name: 'fake_address',
        desc: '伪造一个地址',
        code: '__fake_address',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_bban',
        desc: '伪造一个银行卡号',
        code: '__fake_bban',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_email',
        desc: '伪造一个邮箱地址',
        code: '__fake_email',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_name',
        desc: '伪造一个名称',
        code: '__fake_name',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_paragraph',
        desc: '伪造一个段落',
        code: '__fake_paragraph',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_phone',
        desc: '伪造一个手机号',
        code: '__fake_phone',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_sentence',
        desc: '伪造一句话',
        code: '__fake_sentence',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      },
      {
        name: 'fake_text',
        desc: '伪造一个文本',
        code: '__fake_text',
        args: [{ name: 'locale', desc: '伪造语言', value: '', default: 'zh_CN', required: false }]
      }
    ]
  },
  {
    name: '加解密',
    code: 'ENCRYPTION',
    func: [
      {
        name: 'aes',
        desc: 'AES加密',
        code: '__aes',
        args: [
          { name: 'data', desc: '加密数据', value: '', default: '', required: true },
          { name: 'key', desc: '密钥', value: '', default: '', required: true },
          { name: 'mode', desc: '模式', value: '', default: '', required: true },
          { name: 'size', desc: '块大小', value: '', default: '', required: true },
          { name: 'iv', desc: '初始向量', value: '', default: '', required: false }
        ]
      },
      {
        name: 'rsa',
        desc: 'RSA加密',
        code: '__rsa',
        args: [
          { name: 'data', desc: '加密数据', value: '', default: '', required: true },
          { name: 'public_key', desc: '公共密钥', value: '', default: '', required: true }
        ]
      },
      {
        name: 'md5',
        desc: 'MD5加密',
        code: '__md5',
        args: [{ name: 'data', desc: '加密数据', value: '', default: '', required: true }]
      },
      {
        name: 'base64',
        desc: 'BASE64加密',
        code: '__base64',
        args: [{ name: 'data', desc: '加密数据', value: '', default: '', required: true }]
      }
    ]
  },
  {
    name: '时间日期',
    code: 'DATETIME',
    func: [
      {
        name: 'time',
        desc: '返回当前时间',
        code: '__time',
        args: [{ name: 'format', desc: '时间格式', value: '', default: '', required: false }]
      },
      {
        name: 'year',
        desc: '返回当前年份',
        code: '__year',
        args: []
      },
      {
        name: 'month',
        desc: '返回当前月份',
        code: '__month',
        args: []
      },
      {
        name: 'day',
        desc: '返回当前日期',
        code: '__day',
        args: []
      },
      {
        name: 'hour',
        desc: '返回当前小时',
        code: '__hour',
        args: []
      },
      {
        name: 'minute',
        desc: '返回当前分钟',
        code: '__minute',
        args: []
      },
      {
        name: 'second',
        desc: '返回当前秒',
        code: '__second',
        args: []
      }
    ]
  },
  {
    name: '功能函数',
    code: 'FUNCTIONS',
    func: [
      {
        name: 'setvar',
        desc: '设置局部变量并返回值',
        code: '__setvar',
        args: [
          { name: 'name', desc: '变量名', value: '', default: '', required: true },
          { name: 'value', desc: '变量值', value: '', default: '', required: true }
        ]
      },
      {
        name: 'setprop',
        desc: '设置全局变量并返回值',
        code: '__setprop',
        args: [
          { name: 'name', desc: '变量名', value: '', default: '', required: true },
          { name: 'value', desc: '变量值', value: '', default: '', required: true }
        ]
      },
      {
        name: 'lowercase',
        desc: '字符串转小写',
        code: '__lowercase',
        args: [{ name: 'data', desc: '字符串', value: '', default: '', required: true }]
      },
      {
        name: 'uppercase',
        desc: '字符串转大写',
        code: '__uppercase',
        args: [{ name: 'data', desc: '字符串', value: '', default: '', required: true }]
      },
      {
        name: 'python_eval',
        desc: '执行一句Python表达式并返回结果',
        code: '__python_eval',
        args: [{ name: 'expression', desc: '表达式', value: '', default: '', required: true }]
      }
    ]
  }
  // {
  //   name: '环境变量',
  //   code: 'ENVIRONMENT',
  //   func: []
  // },
  // {
  //   name: '脚本变量',
  //   code: 'VARIABLE',
  //   func: []
  // }
]

export { getFunctions }
