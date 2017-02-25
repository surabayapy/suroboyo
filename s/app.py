"""
 # Copyright (c) 08 2016 | suryakencana
 # 8/13/16 nanang.ask@kubuskotak.com
 #  app
"""

from baka.config import configure


def create_app(global_config, **settings):
    config = configure(settings=settings)
    config.include(__name__)

    return config.make_wsgi_app()


def includeme(config):
    config.include('baka.app')
    config.include('.schedulers')
    config.include('.membership')
    config.include('.sby')
