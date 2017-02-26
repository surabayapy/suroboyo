"""
 # Copyright (c) 2017 Boolein Integer Indonesia, PT.
 # suryakencana 2/20/17 @author nanang.suryadi@boolein.id
 #
 # You are hereby granted a non-exclusive, worldwide, royalty-free license to
 # use, copy, modify, and distribute this software in source code or binary
 # form for use in connection with the web services and APIs provided by
 # Boolein.
 #
 # As with any software that integrates with the Boolein platform, your use
 # of this software is subject to the Boolein Developer Principles and
 # Policies [http://developers.Boolein.com/policy/]. This copyright notice
 # shall be included in all copies or substantial portions of the software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 # THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 # FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 # DEALINGS IN THE SOFTWARE
 # 
 # register
"""
import logging

from ... import mailer
from ..events import RegistrationEvent, ActivationEvent
from ..forms import register
from baka._compat import text_type
from baka.router import route
from baka.i18n import translate as _
from pyramid import httpexceptions

LOG = logging.getLogger(__name__)

# class RegisterView(BaseView):


@route(
    '/register',
    renderer='s:membership/templates/register.html')
def register_view(request):
    return {
        'title': 'Register'
    }


@route(
    '/register',
    request_method='POST',
    renderer='json')
def _register_view(request):

    form = register.RegisterAddForm(request)
    if form.validate():
        user = form.submit()
        LOG.debug(user)
        request.db.add(user)

        # Create a new activation for the user
        Activation = request.find_model('membership.activation')
        activation = Activation()
        request.db.add(activation)
        user.activation = activation

        request.db.flush()

        LOG.debug('')
        # Send the activation email
        message = activation_email(request, user)
        mailer.schedule_email_register(**message)

        request.session.flash(_(
            'Thank you for join Surabaya.py community! '
            "We've sent you an email with an activation link, "
            'before you can sign in <strong>please check your email and open '
            'the link to activate your account</strong>.'), 'success')

        request.registry.notify(
            RegistrationEvent(request, user))

        return {
            'redirect': request.route_url('home'),
            'success_message': _(u'Saved'),
            'response': 0
        }
    else:
        return {
            'error_message': _(u'Please, check errors'),
            'errors': form.errors
        }


@route(
    '/register.activate.{code:.*}',
    request_method='GET',
    renderer='json')
def register_activate(request):
    pid, code = validasi_activation(
        request.matchdict['code'])

    # LOG.debug((pid, code))
    # link = request.route_url(
    #     'register_activate',
    #     code='-'.join(
    #         [text_type(pid),
    #          code]))
    # LOG.debug(link)
    if (pid and code) is not None:
        # cek exist code activation dan cari user berdasarkan nya
        Activation = request.find_model('membership.activation')
        activation = Activation.get_by_code(request.db, code)
        if activation is None:
            request.session.flash(_(
                "We didn't recognize that activation link. "
                "Perhaps you've already activated your account? "
                'If so, try <a href="{url}">signing in</a> using the username '
                'and password that you provided.').format(
                url=request.route_url('_register_view')),
                'error')
            return httpexceptions.HTTPFound(
                location=request.route_url('home'))

        User = request.find_model('membership.user')
        user = User.get_by_activation(request.db, activation)
        if user is None or user.pid != pid:
            raise httpexceptions.HTTPNotFound()

        user.activate()
        request.session.flash(_(
            'Your account has been activated! '
            'You can now <a href="{url}">sign in</a> using the password you '
            'provided.').format(url=request.route_url('_register_view')),
                              'success')

        request.registry.notify(ActivationEvent(request, user))

        return httpexceptions.HTTPFound(
            location=request.route_url('home'))

    return httpexceptions.HTTPNotFound()


def activation_email(request, user):
    """Return the data for an 'activate your account' email for the given user.

    :rtype: dict

    """
    link = request.route_url(
        'register_activate',
        code='-'.join(
            [text_type(user.pid),
             user.activation.code]))
    # link = '-'.join(['register.activate', text_type(user.pid), user.activation.code])
    emailtext = _("Please validate your email and activate your account by visiting: {link}")
    body = emailtext.format(link=link)
    return {
        "request": request,
        "subject": _("Please activate your account"),
        "recipients": [user.email],
        "body": body
    }


def validasi_activation(uri):
    code = pid = None
    splitter = uri.split('-')

    if len(splitter) > 1:
        pid, code = splitter[:2]

    return pid, code


def includeme(config):
    config.scan(__name__)
