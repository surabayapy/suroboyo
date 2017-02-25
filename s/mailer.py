# -*- coding: utf-8 -*-
"""
A module for sending email.

This module defines a Celery task for sending emails in a worker process.
"""
import datetime
from .schedulers import scheduler
from pyramid_mailer import mailer_factory_from_settings

import pyramid_mailer.message
from pyramid_redis_sessions import _generate_session_id
import pytz

__all__ = ('send',)


def send(settings, recipients, subject, body, html=None):
    """
    Send an email.

    :param recipients: the list of email addresses to send the email to
    :type recipients: list of unicode strings

    :param subject: the subject of the email
    :type subject: unicode

    :param body: the body of the email
    :type body: unicode
    """
    email = pyramid_mailer.message.Message(subject=subject,
                                           recipients=recipients,
                                           body=body,
                                           html=html)
    mailer = mailer_factory_from_settings(settings)
    mailer.send_immediately(email)


def schedule_email_register(request, recipients, subject, body, html=None):
    scheduler.add_job(
        send,
        trigger='date',
        id=_generate_session_id(),
        replace_existing=True,
        run_date=datetime.datetime.now(pytz.utc) + datetime.timedelta(minutes=1),
        args=[request.registry.settings, recipients, subject, body, html]
    )
