"""
 # Copyright (c) 2017 Boolein Integer Indonesia, PT.
 # suryakencana 2/23/17 @author nanang.suryadi@boolein.id
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
from ..forms.user import email_validator
from baka import forms
import colander
from baka.i18n import translate as _
from s.membership import helper

LOG = logging.getLogger(__name__)


@colander.deferred
def confirm_email_validator(node, kw):
    request = kw.get('request')

    def validator(_node, value):
        if value and request.params.get('email') != value:
            raise colander.Invalid(
                _node,
                _(u'Email and confirm is not equal'),
            )
    return colander.All(colander.Email(), validator,)


class _RegisterAddSchema(forms.CSRFSchema):
    first = colander.SchemaNode(
        colander.String(),
    )
    last = colander.SchemaNode(
        colander.String(),
    )
    email = colander.SchemaNode(
        colander.String(),
        validator=email_validator
    )
    confirm_email = colander.SchemaNode(
        colander.String(),
        validator=confirm_email_validator
    )
    password = colander.SchemaNode(
        colander.String(),
        validator=colander.All(colander.Length(min=6, max=128))
    )


class _RegisterForm(forms.BaseForm):

    def submit(self, user=None):
        if not user:
            user = self.request.find_model('membership.user')()

        LOG.debug(user)

        user.username = '.'.join([
            self._controls.get('first'),
            self._controls.get('last'),
            helper.generate_random_string(8)])
        user.email = self._controls.get('email')
        user.status = u'member'
        if self._controls.get('password'):
            user.password = self._controls.get('password')
        return user


class RegisterAddForm(_RegisterForm):
    _schema = _RegisterAddSchema
