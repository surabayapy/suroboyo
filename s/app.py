"""
 # Copyright (c) 08 2016 | suryakencana
 # 8/13/16 nanang.ask@kubuskotak.com
 #  app
"""

from baka.config import configure
from baka.settings import EnvSetting, database_url

ENV = [
    EnvSetting('redis.sessions.host', 'REDIS_HOST'),
    EnvSetting('redis.sessions.port', 'REDIS_PORT', type=int),
    EnvSetting('redis.sessions.password', 'REDIS_PWD'),
    EnvSetting('redis.sessions.secret', 'REDIS_SECRET'),
    EnvSetting('scheduler.host', 'REDIS_HOST'),
    EnvSetting('sqlalchemy.url', 'DATABASE_URL', type=database_url),
    EnvSetting('ga_tracking_id', 'GA_ID'),
]


def create_app(global_config, **settings):
    config = configure(settings=settings, env=ENV)
    config.include(__name__)

    return config.make_wsgi_app()


def includeme(config):
    config.include('baka.app')
    config.include('.schedulers')
    config.include('.membership')
    config.include('.sby')
