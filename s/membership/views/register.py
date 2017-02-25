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
from ..events import RegistrationEvent
from ..forms import register
from baka._compat import text_type
from baka.router import route
from baka.i18n import translate as _

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

        # return {
        #     'error_message': True,
        #     'errors': {
        #         'first': 'Required',
        #         'email': 'Required',
        #         'confirm_email': 'Fill Email Required',
        #     }
        # }


def activation_email(request, user):
    """Return the data for an 'activate your account' email for the given user.

    :rtype: dict

    """
    # link = request.route_url('activate', id=user.id, code=user.activation.code)
    link = '-'.join(['register.activate', text_type(user.pid), user.activation.code])
    emailtext = ("Please validate your email and activate your account by "
                 "visiting: {link}")
    body = emailtext.format(link=link)
    return {
        "request": request,
        "subject": _("Please activate your account"),
        "recipients": [user.email],
        "body": body
    }


def includeme(config):
    config.scan(__name__)
